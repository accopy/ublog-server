
const Article = require('../models/article');
const Tags = require('../models/tags');
const Result = require("../utils/utils")

//新增文章
exports.addArticle = (req, res) => {
    const {
        title,
        content,
        tagsName,
        category,
        state,
    } = req.body;
    let author_id = req.auth.id

    //设置category属性
    let categoryName = category.label
    let categoryId = category.value
    // console.log('categoryName', categoryName);
    // console.log('categoryId', categoryId);


    let tempArticle = null;
    tempArticle = new Article({
        title,
        content,
        numbers: content.length,
        // tags: tags,
        category: categoryId,
        state,
        tagsName,
        categoryName: categoryName,

    });
    tempArticle.author = req.auth.id

    tempArticle
        .save()
        .then(data => {
            res.send(Result.success('保存成功!'))
            // 添加到tags表中，目前不反回id,仅测试

            addTag(tagsName, req.auth.id)

        })
        .catch(err => {
            console.log(err);
            throw err

        });


};



//获取个人已发表文章
exports.getArticleList = async (req, res) => {
    let { pageSize, pageNum, queryinfo } = req.body;
    let skipNum = (pageNum - 1) * pageSize;
    let query = null;


    //查询类型处理
    //分类查询
    if (queryinfo.querytype == 'recent') {
        query = { author: req.auth.id };
        //执行
        getPage()
    }
    else if (queryinfo.querytype == 'category') {
        query = { author: req.auth.id, category: req.body.queryinfo.categoryid }
        //执行
        getPage()
    }
    //标签查询
    else if (queryinfo.querytype == 'tags') {
        query = { author: req.auth.id, tagsName: { $elemMatch: { $eq: req.body.queryinfo.key } } }
        let num = await Article.countDocuments(query).catch(err => {
            throw err

        })

        //若无则删除
        if (num == 0) {
            console.log('num', num);

            Tags.deleteMany({ name: req.body.queryinfo.key })
                .then(result => {
                    console.log('result',);
                    // 删除标签成功并返回400(data:400)
                    if (result.deletedCount === 1) {
                        res.send(Result.success(400))
                    }


                })
                .catch(err => {


                    throw err

                });
        }
        else {
            //若有则查询
            let response = await Article.find(query).sort({ create_time: -1 }).skip(skipNum).limit(pageSize).catch(err => {
                throw err
            })

            let articleList = {}

            articleList.count = num
            articleList.list = response
            res.send(Result.success(articleList))

        }

    }


    async function getPage(func) {
        let articleList = {}

        console.log('query', query);
        result = await Promise.all([
            Article.countDocuments(query).catch(err => {
                res.send(Result.validateFailed('服务端错误！'))

            })
            ,
            Article.find(query).sort({ create_time: -1 }).skip(skipNum).limit(pageSize).catch(err => {
                res.send(Result.validateFailed('服务端错误！'))

            })
        ])
        // console.log('result', result);
        articleList.count = result[0]
        articleList.list = result[1]
        res.send(Result.success(articleList))
    }



};


//获取文章详情
exports.getArticleDetail = (req, res) => {
    //req.query获取get参数
    let id = req.query.id
    console.log('req.query.id', id);

    Article.findOne({
        _id: id
    })
        .then(article => {
            //当前对象
            // console.log('articleList', article);
            res.send(Result.success(article))


        })
        .catch(err => {
            throw err
        });
};

//获取个人文章的时间轴
exports.getArticleTimeLine = async (req, res) => {

    const archiveList = []
    let obj = {}
    // 按年份归档 文章数组
    let temp = await Article.find({ author: req.auth.id }, { create_time: 1, _id: 1, title: 1 }).sort({ create_time: -1 })


    temp.forEach(e => {
        let year = e.create_time.getFullYear()
        if (!obj[year]) {
            obj[year] = []
            obj[year].push(e)
        } else {
            obj[year].push(e)
        }

    });

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            let item = {}
            item.year = key
            item.list = element
            archiveList.push(item)
        }
    }
    console.log('archiveList', archiveList);
    res.send(Result.success(archiveList))

    // 聚合查询
    // let result = await Article.aggregate([
    //     {
    //         $match: { author: req.auth.id }
    //     },
    //     {
    //         $group: {
    //             _id: { $year: "$create_time" },  // 按照日期字段的年份进行分组


    //         }
    //     },
    //     {
    //         $sort: { _id: 1 }  // 按年份升序排序
    //     }
    // ]);

};


//
exports.getArticleListSe = (req, res) => {

    Article.find({ author: req.auth.id }, { _id: 1, title: 1 }).sort({ create_time: -1 }).limit(7).then(e => {
        if (e) {
            res.send(Result.success(e))
        }


    })
        .catch(err => {
            throw err

        });
}

//搜索文章
exports.searchArticle = (req, res) => {
    let { key } = req.body;

    if (key) {
        Article.find({
            author: req.auth.id, $or: [
                { title: { $regex: key, $options: 'i' } }, // 包含关键字1的标题
                { content: { $regex: key, $options: 'i' } } // 包含关键字2的内容
            ]
        }).sort({ create_time: -1 }).then(e => {

            res.send(Result.success(e))

        })
            .catch(err => {
                throw err

            });
    } else {
        res.send(Result.validateFailed('服务端错误！'))
    }

}

//更新文章
exports.updateArticle = (req, res) => {
    const {
        title,
        author,
        content,
        img_url,
        category,
        state,
        tagsName,
        _id,
    } = req.body;

    //设置category属性
    let categoryName = category.label
    let categoryId = category.value
    console.log('categoryName', categoryName);
    console.log('categoryId', categoryId);

    Article.findOneAndUpdate(
        { _id },
        {
            title,
            author,
            content,
            img_url,
            categoryName,
            categoryId,
            state,
            tagsName,
            update_time: Date.now()
        },
    ).then(response => {
        if (response) {
            res.send(Result.success(response))

            addTag(tagsName, author)
        }


    })
        .catch(err => {
            console.log(err);
            throw err

        });


};

//删除文章
exports.delArticle = (req, res) => {
    let { id } = req.body;
    Article.deleteMany({ _id: id })
        .then(result => {
            console.log('result', result);

            if (result.deletedCount == 1) {
                res.send(Result.success('删除成功'))
            } else {
                res.send(Result.validateFailed('文章不存在'))
            }
        })
        .catch(err => {
            throw err
        });
};

//定义添加
function addTag(arr, author_id) {
    for (let i = 0; i < arr.length; i++) {
        let query = { author_id, name: arr[i] }

        Tags.findOne(query)
            .then(result => {
                console.log('result', result);

                if (!result) {
                    let temptags = new Tags(query);
                    temptags
                        .save()
                        .catch(err => {
                            throw err;
                        });
                }
                else {
                    console.log('已存在');
                }
            })
            .catch(err => {
                throw err;
                console.log('出错了');

            });

    }


}







