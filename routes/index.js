/*
*所有的路由接口
*/
const user = require('./user');
const article = require('./article');
const category = require('./category');
const tags = require('./tags');

module.exports = app => {
    app.post('/api/register', user.register);
    app.post('/api/login', user.login);

    app.post('/addArticle', article.addArticle)
    app.post('/getArticleList', article.getArticleList)
    app.get('/getArticleDetail', article.getArticleDetail)
    app.get('/getArticleTimeLine', article.getArticleTimeLine);
    app.get('/getArticleListSe', article.getArticleListSe);
    app.post('/searchArticle', article.searchArticle)
    app.post('/updateArticle', article.updateArticle);
    app.post('/delArticle', article.delArticle);


    app.post('/addCategory', category.addCategory);
    app.post('/delCategory', category.delCategory);
    app.post('/getCategoryNum', category.getCategoryNum);
    app.get('/getCategoryList', category.getCategoryList);

    app.post('/addTags', tags.addTags);
    app.post('/delTags', tags.delTags);
    app.get('/getTagsList', tags.getTagsList);



};



