const mongoose = require("./db.js");

//定义结构
let userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            default: '',
            required: true,
            validate: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
        },
        // 密码
        password: {
            type: String,
            required: true,
        },
        //用户类型
        type: { type: Number, default: 1 },

        // 创建日期
        create_time: { type: Date, default: Date.now },
        // 最后修改日期
        update_time: { type: Date, default: Date.now },


    },
    { versionKey: false }//隐藏_v字段

);

module.exports = mongoose.model("User", userSchema, "user");
