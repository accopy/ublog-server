const Result = require("../utils/utils")
const Tags = require('../models/tags');

//获取个人全部标签
exports.getTagsList = (req, res) => {
    let author_id = req.auth.id

    Tags.find({ author_id }).then(response => {

        if (response) {
            res.send(Result.success(response))
        }

    });
}


//获取标签名称
exports.getTagsOne = (req, res) => {
    let id = req.query.id;
    console.log('id', id);

    Tags.find({ _id: id }).then(response => {

        if (response) {

            res.send(Result.success(response))
        }
    }).catch(err => {
        return err
    });;

};