// 1. 引入依赖
const multer = require('multer');
const md5 = require('md5');

const fileName = "file"  // 上传的 fileName 名称
const updateBaseUrl = require('../../config').updateBaseUrl
const imgPath = "/api/images/" // 上传到服务器的虚拟目录

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imgPath)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})


const upload = multer({ storage }).single('avatar')

// 上传接口的 请求参数req  响应参数res
function uploadfunc(req, res) {


    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.


        } else if (err) {
            // An unknown error occurred when uploading.
        }

        // Everything went fine.
    })






}

module.exports = uploadfunc;
