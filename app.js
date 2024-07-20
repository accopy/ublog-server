const express = require('express');
const bodyParser = require('body-parser')
var cors = require('cors')


// 之后每个响应头都会被设置
const expressJwt = require("express-jwt");
const secretKey = require('./utils/token').jwtScrect

const hostname = 'localhost';

const app = express();
let port = require("./config").port

app.use(cors())


app.use(bodyParser.urlencoded({ extended: false }))// parse application/x-www-form-urlencoded
app.use(bodyParser.json())// parse application/json
app.use(expressJwt.expressjwt({ secret: secretKey, algorithms: ["HS256"] }).unless({
    path: [/^\/api\//], //'/api'开头的接口无需验证
}))
app.use((err, req, res, next) => {   //错误捕捉
    if (err.name === 'UnauthorizedError') {
        return res.send({ code: 401, msg: '无效的token' })
    }
    else if (err.name === 'MongooseError') {
        return res.send({ code: 401, msg: 'MongooseError' })
    }
    else if (err.name == "triggerUncaughtException") {
        return res.send({ code: 401, msg: 'MongooseError' })
    }
    else if (err.name = ' ErrorCaptureStackTrace') {
        return res.send({ code: 500, msg: 'MongooseError' })
    }
    else {
        return res.send({ code: 500, msg: '其他错误' })
    }
})

const route = require('./routes/index'); //将路由文件引入
route(app); //初始化所有路由

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
