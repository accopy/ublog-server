/*
*所有的路由接口
*/
const user = require('./user');
const article = require('./article');
const category = require('./category');
const tags = require('./tags');
const blogtopub = require("./api-public")

const path = require('path')

const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 定义上传文件的目录  
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // 生成唯一的文件名  
    }
});


const upload = multer({ storage: storage });




module.exports = app => {

    app.post('/api/getArticleList', blogtopub.getArticleList);
    app.get('/api/getArticleDetail', blogtopub.getArticleDetail);
    app.get('/api/getArticleTimeLine', blogtopub.getArticleTimeLine);
    app.get('/api/getArticleListSe', blogtopub.getArticleListSe);
    app.post('/api/getCategoryNum', blogtopub.getCategoryNum);
    app.post('/api/searchArticle', blogtopub.searchArticle)

    // app.post('/api/register', user.register);
    app.post('/api/login', user.login);
    app.get('/myinfo', user.myinfo);
    // 上传图片接口
    // app.post('/uploadImage', user.uploadImage);
    app.post('/api/uploadImage', upload.single('file'), function (req, res, next) {
        console.log('req.file', req.file);

        res.send({ status: 200, message: 'File uploaded successfully' });
    });




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


    app.get('/getTagsList', tags.getTagsList);




};



