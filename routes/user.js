const User = require('../models/user');
const Category = require('../models/category');

const upload = require('../utils/multer/upload');
const imgPath = '/img/images/'; // 上传到服务器的虚拟目录
const updateBaseUrl = require('../config').updateBaseUrl; // 上传到服务器地址
const { setToken } = require('../utils/token');
const Result = require('../utils/utils');

//注册
exports.register = async (req, res) => {
  let { password, email, type, username } = req.body;

  if (!email) {
    res.send(Result.validateFailed('邮箱不能为空！'));
    return;
  }
  const reg = new RegExp(
    '^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$',
  ); //正则表达式
  if (!reg.test(email)) {
    res.send(Result.validateFailed('请输入格式正确的邮箱！'));
    return;
  }
  if (!username) {
    res.send(Result.validateFailed('用户名不可为空！'));
    return;
  }
  if (!password) {
    res.send(Result.validateFailed('密码不可为空！'));
    return;
  }

  //验证用户是否已经在数据库中
  let result = await Promise.all([
    User.findOne({ email: email }).catch((err) => {
      res.send(Result.validateFailed('服务端错误！'));
    }),
    User.findOne({ username: username }).catch((err) => {
      res.send(Result.validateFailed('服务端错误！'));
    }),
  ]);

  if (result[0]) {
    res.send(Result.validateFailed('用户邮箱已存在！'));
    return;
  } else if (result[1]) {
    res.send(Result.validateFailed('用户名已存在！'));
    return;
  } else {
    //创建用户
    let user = new User({
      email,
      username,
      password,
      type,
    });

    user
      .save()
      .then((data) => {
        console.log('data', data);
        res.send(Result.success('注册成功！'));

        //插入分类
        if (data.id) {
          createDefautCateGory(data.id, data.username);
        }
      })
      .catch((err) => {
        res.send(res);
        throw err;
      });
  }
};

//登录
exports.login = (req, res) => {
  let { username, password } = req.body;
  if (!username) {
    res.send(Result.validateFailed('用户名不可为空！'));
    return;
  }
  if (!password) {
    res.send(Result.validateFailed('密码不可为空！'));
    return;
  }
  User.findOne({
    username,
    password,
  })
    .then((userInfo) => {
      //当前对象

      if (userInfo) {
        setToken(userInfo).then((response) => {
          res.send(Result.success(response));
        });
      } else {
        res.send(Result.validateFailed('账号密码错误！'));
      }
    })
    .catch((err) => {
      throw err;
    });
};

//获取用户信息
exports.myinfo = (req, res) => {
  let id = req.auth.id;
  User.findOne({ _id: id }).then((result) => {
    res.send(Result.success(result));
  });
};

//更改用户信息
exports.updatemyinfo = (req, res) => {
  const { name, avatar } = req.body;

  let id = req.auth.id;
  User.findOneAndUpdate(
    { _id: id },
    {
      name,
      avatar,
      update_time: Date.now(),
    },
  ).then((result) => {
    res.send(Result.success(result));
  });
};

//上传图片
exports.uploadImage = (req, res) => {
  upload(req, res).then((imgsrc) => {
    let result = updateBaseUrl + imgPath + imgsrc;
    res.send(Result.success(result));
  });
};

//方法
//创建默认分类目录
function createDefautCateGory(id, username) {
  const category = [
    { author_id: id, name: '知识技能', username },
    { author_id: id, name: '应用笔记', username },
    { author_id: id, name: '生活思考', username },
    { author_id: id, name: '经验谈', username },
    { author_id: id, name: '其他', username },
  ];
  Category.insertMany(category);
}
