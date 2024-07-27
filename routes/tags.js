const Result = require('../utils/utils');
const Tags = require('../models/tags');

//获取个人全部标签
exports.getTagsList = (req, res) => {
  let author_id = req.auth.id;

  Tags.find({ author_id }).then((response) => {
    if (response) {
      res.send(Result.success(response));
    }
  });
};
