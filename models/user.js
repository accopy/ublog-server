const mongoose = require('./db.js');

//定义结构
let userSchema = mongoose.Schema(
  {
    /**
     *网名
     */
    name: {
      type: String,
      required: true,
      default: 'user',
    },
    /**
     *账号
     */
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: '',
      validate: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
    },

    /**
     *头像base64
     */
    avatar: {
      type: String,
      default: 'null',
    },
    // 密码
    password: {
      type: String,
      required: true,
    },
    //用户类型 0管理员,1普通用户
    type: { type: Number, default: 1 },

    // 创建日期
    create_time: { type: Date, default: Date.now },
    // 最后修改日期
    update_time: { type: Date, default: Date.now },
  },
  { versionKey: false }, //隐藏_v字段
);

module.exports = mongoose.model('User', userSchema, 'user');
