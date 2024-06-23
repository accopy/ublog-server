const User = require('../models/user');
const Category = require('../models/category');
const { setToken } = require('../utils/token')
const Result = require("../utils/utils")

//注册
exports.register = (req, res) => {

    let { password, email, type } = req.body;
    let name = 2;

    if (!email) {
        res.send(Result.validateFailed('邮箱不能为空！'))
        return;
    }
    const reg = new RegExp(
        '^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$',
    ); //正则表达式
    if (!reg.test(email)) {
        res.send(Result.validateFailed('请输入格式正确的邮箱！'))
        return;
    }
    if (!name) {
        res.send(Result.validateFailed('用户名不可为空！'))
        return;
    }
    if (!password) {
        res.send(Result.validateFailed('用户名不可为空！'))
        return;
    }
    //验证用户是否已经在数据库中
    User.findOne({ email: email })
        .then(data => {
            if (data) {
                res.send(Result.validateFailed('用户邮箱已存在！'))
                return;
            }
            //保存到数据库
            let user = new User({
                email,
                name,
                password,
                type,
            });
            user.save().then(data => {
                console.log('data', data);
                res.send(Result.success('注册成功！'))

                //插入分类
                if (data.id) {
                    createDefautCateGory(data.id)
                }

            });
        })
        .catch(err => {
            res.send(res);
            return;
        });
    function createDefautCateGory(id) {

        //创建默认分类目录
        const category = [
            { author_id: id, name: '知识技能' },
            { author_id: id, name: '应用笔记' },
            { author_id: id, name: '经验谈' },
            { author_id: id, name: '生活思考' },
            { author_id: id, name: '其他' },

        ];

        Category.insertMany(category)
    }


};

//登录
exports.login = (req, res) => {
    let { email, password } = req.body;
    if (!email) {
        res.send(Result.validateFailed('用户邮箱不可为空！'))
        return;
    }
    if (!password) {
        res.send(Result.validateFailed('密码不可为空！'))
        return;
    }
    User.findOne({
        email,
        password,
    })
        .then(userInfo => {
            //当前对象
            console.log('userInfo', userInfo.id);
            setToken(userInfo).then(response => {
                res.send(Result.success(response))
            })

        })
        .catch(err => {
            res.send(Result.validateFailed('账号密码错误！'))

        });
};
