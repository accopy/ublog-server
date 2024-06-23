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
//添加标签
exports.addTags = (req, res) => {
    let { name, desc } = req.body;
    let author_id = req.auth.id
    Tags.findOne({
        author_id,
        name,
    })
        .then(result => {
            if (!result) {
                let category = new Tags({
                    author_id,
                    name,
                    desc,
                });
                Tags
                    .save()
                    .then(data => {
                        res.send(Result.success('添加成功!'))
                    })
                    .catch(err => {
                        throw err;
                    });
            } else {
                res.send(Result.validateFailed('该标签已存在!'))
            }
        })
        .catch(err => {
            res.send(Result.fail(err))
        });
};
//删除标签
exports.delTags = (req, res) => {
    let { id } = req.body;


    Tags.deleteMany({ _id: id })
        .then(result => {
            console.log('result', result);
            if (result.deletedCount === 1) {
                res.send(Result.success('操作成功!'))


            } else {
                res.send(Result.validateFailed('标签不存在!'))
            }
        })
        .catch(err => {
            console.error('err :', err);
            res.send(Result.fail(res))

        });
};
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