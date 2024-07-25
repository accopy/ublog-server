const express = require('express');
const bodyParser = require('body-parser')
var cors = require('cors')

// 之后每个响应头都会被设置
const expressJwt = require("express-jwt");
const secretKey = require('./utils/token').jwtScrect

const hostname = 'localhost';

const app = express();
let port = require("./config").port
// 公开静态文件夹，匹配`虚拟路径img` 到 `真实路径public` 注意这里  /img/ 前后必须都要有斜杠！！！
app.use('/img/', express.static('./public/'))

app.use(cors())


app.use(bodyParser.urlencoded({ extended: false }))// parse application/x-www-form-urlencoded
app.use(bodyParser.json())// parse application/json
app.use(expressJwt.expressjwt({ secret: secretKey, algorithms: ["HS256"] }).unless({
    path: [/^\/api\//], //'/api'开头的接口无需验证
}))
// 禁止缓存指定文件类型的图片，例如 .jpg 和 .png
app.use((req, res, next) => {
    if (req.url.endsWith('.jpg') || req.url.endsWith('.png')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
    }
    next();
});
app.use((err, req, res, next) => {
    console.log('app----err', err);
    //错误捕捉
    throw err
})

const route = require('./routes/index'); //将路由文件引入
route(app); //初始化所有路由

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
