const Article = require('../models/article');
const Tags = require('../models/tags');
const Result = require('../utils/BaseResultCode');
//新增文章
exports.addArticle = (req, res) => {
  const { title, content, tagsName, category, state } = req.body;

  //生成简介
  let desc = toText(content);

  let tempArticle = null;
  tempArticle = new Article({
    title,
    content,
    numbers: content.length,
    desc,
    state,
    category,
    tagsName,
  });

  tempArticle.author_id = req.auth.id;
  tempArticle.username = req.auth.username;
  tempArticle.authorName = req.auth.name;

  tempArticle
    .save()
    .then((data) => {
      res.send(Result.success('保存成功!'));
      // 添加到tags表中，目前不反回id,仅测试
      handleTag('articleAdd', data.tagsName, req.auth);
      console.log('data', data);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

//获取文章详情
exports.getArticleDetail = (req, res) => {
  //req.query获取get参数
  let id = req.query.id;
  console.log('req.query.id', id);

  Article.findOne({
    _id: id,
  })
    .then((article) => {
      //当前对象
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
    { author_id: req.auth.id },
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

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const element = obj[key];
      let item = {};
      item.year = key;
      item.list = element;
      archiveList.push(item);
    }
  }
  console.log('archiveList', archiveList);
  res.send(Result.success(archiveList));
};

//获取最近更新
exports.getArticleListSe = (req, res) => {
  Article.find({ author_id: req.auth.id }, { _id: 1, title: 1 })
    .sort({ create_time: -1 })
    .limit(7)
    .then((e) => {
      if (e) {
        res.send(Result.success(e));
      }
    })
    .catch((err) => {
      throw err;
    });
};

//搜索文章
exports.searchArticle = async (req, res) => {
  let { pageParam, category, tags, key } = req.body;
  //定义分页
  let pageNum = pageParam.pageNum || 1; //默认第一页
  let pageSize = pageParam.pageSize || 10; //默认每次10项
  let skipNum = (pageNum - 1) * pageSize;
  //设置查询体
  let query = {
    author_id: req.auth.id,
    category: category,
    tagsName: tags,
    $or: [
      { title: { $regex: key, $options: 'i' } }, // 包含关键字1的标题
      { content: { $regex: key, $options: 'i' } }, // 包含关键字2的内容
    ],
  };
  for (prop in query) {
    if (query[prop] === '') {
      delete query[prop];
    }
  }

  let result = await Promise.all([
    Article.countDocuments(query).catch((err) => {
      res.send(Result.validateFailed('服务端错误！'));
    }),
    Article.find(query)
      .sort({ create_time: -1 })
      .skip(skipNum)
      .limit(pageSize)
      .catch((err) => {
        res.send(Result.validateFailed('服务端错误！'));
      }),
  ]);

  let articleList = {};
  articleList.count = result[0];
  articleList.list = result[1];
  res.send(Result.success(articleList));
};

//更新文章
exports.updateArticle = (req, res) => {
  const { title, content, img_url, category, state, tagsName, _id } = req.body;
  // console.log('传过来的tagsName', tagsName);
  //设置category属性
  let categoryName = category.label;
  let categoryId = category.value;

  let desc = toText(content); //生成简介
  // console.log('categoryName', categoryName);
  // console.log('categoryId', categoryId);

  Article.findOneAndUpdate(
    { _id },
    {
      title,
      content,
      img_url,
      category,
      state,
      tagsName,
      categoryName,
      desc,
      category: categoryId,
      update_time: Date.now(),
    },
  )
    .then((response) => {
      if (response) {
        //response为修改之前的数据
        res.send(Result.success(response));
        // console.log('response', response);
        //旧标签查询，若无则删除,并新增
        handleTag('articleEdit', tagsName, req.auth, response.tagsName);
      }
    })
    .catch((err) => {
      throw err;
    });
};

//删除文章
exports.delArticle = (req, res) => {
  let { id } = req.body;
  Article.findByIdAndDelete({ _id: id })
    .then((result) => {
      // console.log('deleteManyresult', result);

      if (result) {
        res.send(Result.success('删除成功'));
        //旧标签查询，若无则删除,并新增
        handleTag('articleDelete', result.tagsName, req.auth);
      } else {
        res.send(Result.validateFailed('文章不存在'));
      }
    })
    .catch((err) => {
      throw err;
    });
};

//标签同步处理
async function handleTag(type, arr, user, oldarr) {
  if (type == 'articleAdd') {
    for (let i = 0; i < arr.length; i++) {
      let query = { author_id: user.id, name: arr[i], username: user.username };
      Tags.findOne(query).then((result) => {
        if (!result) {
          let temptags = new Tags(query);
          temptags.save().catch((err) => {
            throw err;
          });
        }
      });
    }
  } else if (type == 'articleEdit') {
    //删除无效标签
    for (let i = 0; i < oldarr.length; i++) {
      let query = { author_id: user.id, tagsName: oldarr[i], username: user.username };

      let result = await Article.countDocuments(query);
      if (result == 0) {
        Tags.findOneAndDelete({ name: query.tagsName, author_id: user.id }).then((result) => {});
      }
    }
    // 新增标签

    for (let i = 0; i < arr.length; i++) {
      let query = { author_id: user.id, name: arr[i], username: user.username };
      Tags.findOne(query).then((result) => {
        if (!result) {
          let temptags = new Tags(query);
          temptags.save().catch((err) => {
            throw err;
          });
        }
      });
    }
  } else if (type == 'articleDelete') {
    console.log('删除');

    //删除无效标签
    for (let i = 0; i < arr.length; i++) {
      let query = { author_id: user.id, tagsName: arr[i], username: user.username };

      let result = await Article.countDocuments(query);
      console.log('包含标签的数量为', result);

      if (result == 0) {
        console.log('为0删除');
        console.log('query.tagsName', query.tagsName);

        Tags.findOneAndDelete({ name: arr[i], author_id: user.id }).then((result) => {});
      }
    }
  }
}

//mark to text
function toText(mark) {
  return mark
    .substr(0, 300)
    .replace(/\*\*/g, '') // 移除粗体和斜体标记
    .replace(/\*/g, '')
    .replace(/#.*\n/g, '') // 移除标题标记
    .replace(/!$$.* $$$.* $ /g, '') // 移除图片
    .replace(/$$.*$$$.* $ /g, '') // 移除链接
    .replace(/\n/g, ' ') // 将换行符替换为空格
    .replace(/\s+/g, ' '); // 替换多余的空格
}
