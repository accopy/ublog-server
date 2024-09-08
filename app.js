const express = require('express');
let cors = require('cors');
const bodyParser = require('body-parser');

const expressJwt = require('express-jwt');
let { jwtScrect: secretKey } = require('./systemConfig');
let { port } = require('./systemConfig');

const app = express();

// 公开静态文件夹，匹配`虚拟路径img` 到 `真实路径public` 注意这里  /img/ 前后必须都要有斜杠！！！
app.use('/img/', express.static('./public/'));
app.use(bodyParser.json({ limit: '2100000kb' }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

//token验证
app.use(
  expressJwt.expressjwt({ secret: secretKey, algorithms: ['HS256'] }).unless({
    path: [/^\/api\//], //'/api'开头的接口无需验证
  }),
);

//异常处理
app.use((err, req, res, next) => {
  if (err.status == 401) {
    res.send({ code: 401, data: '登录过期' });
    return;
  }
  //错误捕捉
  throw err;
});

//将路由文件引入
const route = require('./routes/index');
//初始化所有路由
route(app);

app.listen(port, () => {
  console.log(`Server running at :${port}`);
});
