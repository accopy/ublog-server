const Result = require('../utils/utils');
const Category = require('../models/category');

const Article = require('../models/article');

//获取个人全部分类
exports.getCategoryList = (req, res) => {
  let author_id = req.auth.id;

  Category.find({ author_id })
    .then((response) => {
      if (response) {
        res.send(Result.success(response));
      }
    })
    .catch((err) => {
      throw err;
    });
};

//添加分类
exports.addCategory = (req, res) => {
  let { name } = req.body;
  let author_id = req.auth.id;
  let username = req.auth.username;
  Category.findOne({
    author_id,
    name,
  })
    .then((result) => {
      if (!result) {
        let category = new Category({
          author_id,
          name,
          username,
        });
        category.save().then((data) => {
          res.send(Result.success('添加成功!'));
        });
      } else {
        res.send(Result.validateFailed('该分类已存在!'));
      }
    })
    .catch((err) => {
      throw err;
    });
};
//删除分类
exports.delCategory = (req, res) => {
  let { id } = req.body;

  Category.deleteMany({ _id: id })
    .then((result) => {
      console.log('result', result);
      if (result.deletedCount === 1) {
        res.send(Result.success('操作成功!'));
      } else {
        res.send(Result.validateFailed('分类不存在!'));
      }
    })
    .catch((err) => {
      console.error('err :', err);
      throw err;
    });
};

//查询分类及每个分类的文章数量
exports.getCategoryNum = (req, res) => {
  let author_id = req.auth.id;
  async function getNum() {
    let result = await Category.find({ author_id });
    let newResult = [];

    for (let i = 0; i < result.length; i++) {
      let count = await Article.countDocuments({ category: { $elemMatch: { $eq: result[i].id } } });
      let { id, name } = result[i];
      let obj = { id, name, count };

      newResult.push(obj);
    }

    res.send(Result.success(newResult));
  }

  getNum();
};
