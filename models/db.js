//连接数据库
// 导入 mongoose 模块
const mongoose = require('mongoose');

//数据库连接地址+数据库名称（aliyun）
const DBURL = 'mongodb://ublog:bmNDr2AjHaf5KLfB@47.108.94.23/ublog';
//连接数据库
mongoose
  .connect(DBURL)
  .then((res) => {
    console.log('数据库连接成功');
  })
  .catch((e) => {
    console.log('数据库连接失败');
  });

module.exports = mongoose;
