//无需token可访问的接口
const Article = require('../models/article');
const Category = require('../models/category');
const Tags = require('../models/tags');
const User = require('../models/user');
const Result = require('../utils/utils');

const authorUserName = require('../config').authorUserName;

//获取文章
exports.getArticleList = async (req, res) => {
  let { pageSize, pageNum, queryinfo } = req.body;
  let skipNum = (pageNum - 1) * pageSize;
  let query = null;

  //查询类型处理
  //分类查询
  if (queryinfo.querytype == 'recent') {
    query = { username: authorUserName };
    //执行
    getPage();
  } else if (queryinfo.querytype == 'category') {
    query = { username: authorUserName, category: req.body.queryinfo.categoryid };
    //执行
    getPage();
  }
  //标签查询
  else if (queryinfo.querytype == 'tags') {
    query = { username: authorUserName, tagsName: { $elemMatch: { $eq: req.body.queryinfo.key } } };
    let num = await Article.countDocuments(query).catch((err) => {
      throw err;
    });

    //若无则删除
    if (num == 0) {
      console.log('num', num);

      Tags.deleteMany({ name: req.body.queryinfo.key })
        .then((result) => {
          console.log('result');
          // 删除标签成功并返回400(data:400)
          if (result.deletedCount === 1) {
            res.send(Result.success(400));
          }
        })
        .catch((err) => {
          throw err;
        });
    } else {
      //若有则查询
      let response = await Article.find(query)
        .sort({ create_time: -1 })
        .skip(skipNum)
        .limit(pageSize)
        .catch((err) => {
          throw err;
        });

      let articleList = {};

      articleList.count = num;
      articleList.list = response;
      res.send(Result.success(articleList));
    }
  }

  //查询文章
  async function getPage(func) {
    let articleList = {};
    result = await Promise.all([
      Article.countDocuments(query).catch((err) => {
        res.send(Result.validateFailed('服务端错误！'));
      }),
      Article.find(query, { content: 0 })
        .sort({ create_time: -1 })
        .skip(skipNum)
        .limit(pageSize)
        .catch((err) => {
          res.send(Result.validateFailed('服务端错误！'));
        }),
    ]);
    // console.log('result', result);
    articleList.count = result[0];
    articleList.list = result[1];
    res.send(Result.success(articleList));
  }
};

//获取文章详情
exports.getArticleDetail = (req, res) => {
  //req.query获取get参数
  let id = req.query.id;

  Article.findOne({
    _id: id,
  })
    .then((article) => {
      // console.log('articleList', article);
      res.send(Result.success(article));
    })
    .catch((err) => {
      throw err;
    });
};

//获取个人文章的时间轴
exports.getArticleTimeLine = async (req, res) => {
  const archiveList = [];
  let obj = {};
  // 按年份归档 文章数组
  let temp = await Article.find(
    { username: authorUserName },
    { create_time: 1, _id: 1, title: 1 },
  ).sort({ create_time: -1 });

  temp.forEach((e) => {
    let year = e.create_time.getFullYear();
    if (!obj[year]) {
      obj[year] = [];
      obj[year].push(e);
    } else {
      obj[year].push(e);
    }
  });

  // console.log('obj', obj);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const element = obj[key];
      let item = {};
      item.year = key;
      item.list = element;
      archiveList.push(item);
    }
  }
  // console.log('archiveList', archiveList.reverse());
  res.send(Result.success(archiveList.reverse()));
};

//获取最近更新
exports.getArticleListSe = (req, res) => {
  Article.find({ username: authorUserName }, { _id: 1, title: 1 })
    .sort({ create_time: -1 })
    .limit(7)
    .then((result) => {
      if (result) {
        // console.log('result', result);

        res.send(Result.success(result));
      }
    })
    .catch((err) => {
      throw err;
    });
};

//查询分类及其数量
exports.getCategoryNum = async (req, res) => {
  let result = await Category.find({ username: authorUserName });
  let newResult = [];

  for (let i = 0; i < result.length; i++) {
    let count = await Article.countDocuments({ category: { $elemMatch: { $eq: result[i].id } } });
    let { id, name } = result[i];
    let obj = { id, name, count };
    newResult.push(obj);
  }

  res.send(Result.success(newResult));
};

//获取个人全部标签
exports.getTagsList = (req, res) => {
  Tags.find({ username: authorUserName }).then((response) => {
    if (response) {
      res.send(Result.success(response));
    }
  });
};

//搜索文章
exports.searchArticle = (req, res) => {
  let { key } = req.body;

  if (key) {
    Article.find({
      username: authorUserName,
      $or: [
        { title: { $regex: key, $options: 'i' } }, // 包含关键字1的标题
        { content: { $regex: key, $options: 'i' } }, // 包含关键字2的内容
      ],
    })
      .sort({ create_time: -1 })
      .then((e) => {
        res.send(Result.success(e));
      })
      .catch((err) => {
        throw err;
      });
  } else {
    res.send(Result.validateFailed('请输入查询关键字！'));
  }
};

//获取个人信息
exports.myinfo = (req, res) => {
  User.findOne({ username: authorUserName }).then((result) => {
    res.send(Result.success(result));
  });
};

//查询分类名称
exports.getCategoryList = (req, res) => {
  Category.find({ username: authorUserName }).then((result) => {
    res.send(Result.success(result));
  });
};
