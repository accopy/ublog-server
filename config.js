//服务端口
const port = 3000;

const authorUserName = 'admin'; //用户名
const updateBaseUrl = `http://localhost:${port}`; //默认上传地址，暂时废弃

module.exports = {
  port,
  authorUserName,
  updateBaseUrl,
};
