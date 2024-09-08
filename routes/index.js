//接口入口
const user = require('./user');
const article = require('./article');
const category = require('./category');
const tags = require('./tags');
//无需token可访问
const api_public = require('./api_public');

module.exports = (app) => {
  app.post('/api/getArticleList', api_public.getArticleList);
  app.get('/api/getArticleDetail', api_public.getArticleDetail);
  app.get('/api/getArticleTimeLine', api_public.getArticleTimeLine);
  app.get('/api/getArticleListSe', api_public.getArticleListSe);
  app.post('/api/searchArticle', api_public.searchArticle);
  app.post('/api/getCategoryNum', api_public.getCategoryNum);
  app.get('/api/getCategoryList', api_public.getCategoryList);
  app.get('/api/myinfo', api_public.myinfo);
  app.get('/api/getTagsList', api_public.getTagsList);

  // app.post('/api/register', user.register); //关闭注册
  app.post('/api/login', user.login);
  app.get('/myinfo', user.myinfo);
  app.post('/updatemyinfo', user.updatemyinfo);
  app.post('/api/uploadImage', user.uploadImage);

  app.post('/addArticle', article.addArticle);
  app.get('/getArticleDetail', article.getArticleDetail);
  app.get('/getArticleTimeLine', article.getArticleTimeLine);
  app.get('/getArticleListSe', article.getArticleListSe);
  app.post('/searchArticle', article.searchArticle);
  app.post('/updateArticle', article.updateArticle);
  app.post('/delArticle', article.delArticle);

  app.post('/addCategory', category.addCategory);
  app.post('/delCategory', category.delCategory);
  app.post('/getCategoryNum', category.getCategoryNum);
  app.get('/getCategoryList', category.getCategoryList);

  app.get('/getTagsList', tags.getTagsList);
};
