/**
 * 服务启动端口
 */
const port = 3000;
/**
 * 作者名称
 */
const authorUserName = 'admin';
/**
 * jwt密钥
 */
const jwtScrect = '96E79218965EB72C92A549DD5A330115';
/**
 * token过期的时间 {xxx+h}
 */
const expiresIn = '720h';

//默认上传地址
const uploadAddress = `http://localhost:${port}`;

module.exports = {
  port,
  authorUserName,
  uploadAddress,
  jwtScrect,
  expiresIn,
};
