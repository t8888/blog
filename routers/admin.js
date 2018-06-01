const express = require('express');
const router = express.Router();
const  User = require('../models/User');
const  Category = require('../models/Category');
const  Content = require('../models/Content');
router.use(function (req,res,next) {
    if(!req.userInfo.isAdmin){
        res.send('您不是管理员！');
        return;
    }
    next();
})

//渲染后台管理页面
router.get('/',(req,res,next)=>{
    res.render('admin/index',{userInfo:req.userInfo})
});

//用户管理操作
router.get('/user',(req,res,next)=>{
    //读取数据库
    let page = req.query.page || 1;
    let limit = 10;

    
    User.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count/limit);
        //取值不能超过Pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        let skip = (page-1) * limit;
        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                page:page,
                pages:pages,
                count:count,
                limit:limit
            })
        })
    })


});

//分类管理
router.get('/category',function (req,res,next) {
    //读取数据库
    let page = req.query.page || 1;
    let limit = 10;
    Category.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过Pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);

        let skip = (page - 1) * limit;
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                page: page,
                pages: pages,
                count: count,
                limit: limit
            })

        })
    })

});

//添加分类
router.get('/category/add',function (req,res,next) {
    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
});
//保存分类
router.post('/category/add',function (req,res,next) {
    let name = req.body.name || '';
    if( name == '' ){
        res.render('admin/error',{
            userInfo: req.userInfo,
            msg: "分类名称不能为空"
        });
        return;
    }

    Category.findOne({name}).then((categoryName)=>{
        if( categoryName ){
            res.render('admin/error',{
                userInfo: req.userInfo,
                msg: "该分类已经存在"
            });
            return Promise.reject();
        } else {
            return new Category({name}).save();
        }
    }).then((newCategory)=>{
        if(newCategory){
            res.render('admin/success',{
                userInfo: req.userInfo,
                msg: "分类添加成功",
                url: '/admin/category'
            })
        }
    }).catch(()=>{});

});
// 修改分类
router.get('/category/edit',(req,res)=>{
    let id= req.query.id || '';
    Category.findOne({_id:id}).then(function (category) {
        if(!category){
            res.render('admin/error',{
                userInfo:res.userInfo,
                msg:'分类信息不存在'
            })
       }else {
            res.render('admin/category_edit',{
                userInfo:res.userInfo,
                category:category
            })
        }

    })
})
//分类修改保存
router.post('/category/edit',function (req,res) {
    let _id = req.query.id || '';
    let name = req.body.name || '';
    Category.findOne({_id}).then((category)=>{
        if(!category){
            res.render('admin/error',{
                userInfo: req.userInfo,
                msg: '分类名称不存在'
            });
            return Promise.reject();
        } else {
            if(name == category.name){
                res.render('admin/success',{
                    userInfo: req.userInfo,
                    msg: '分类修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                return Category.findOne({_id: {$ne: _id}, name})
            }
        }
    }).then((sameCategory)=>{
        if(sameCategory){
            res.render('admin/error',{
                userInfo: req.userInfo,
                msg: '数据库中存在同名分类'
            });
            return Promise.reject();
        } else {
            return Category.update({_id}, {name});
        }
    }).then(()=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '分类修改成功',
            url: '/admin/category'
        });
    }).catch(()=>{});
});
//删除分类
router.get('/category/delete',function (req,res) {
    let id = req.query.id || '';
    Category.remove({
        _id:id
    }).then(()=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '分类删除成功',
            url: '/admin/category'
        });
    })
});

//内容首页
router.get('/content',function (req,res) {

    //读取数据库
    let page = req.query.page || 1;
    let limit = 10;
    Content.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过Pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);

        let skip = (page - 1) * limit;
        Content.find().limit(limit).skip(skip).populate(['category','user']).then(function (contents) {
            // console.log(contents)
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                page: page,
                pages: pages,
                count: count,
                limit: limit
            })

        })
    })
});

//内容添加
router.get('/content/add',function (req,res) {
    Category.find().sort({_id:-1}).then((categories)=>{
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        })
    })

});

//内容保存
router.post('/content/add',(req,res)=>{
    if(req.body.category == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            msg:'内容分类不能为空'
        });
        return
    }
    if(req.body.title == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            msg:'内容标题不能为空'
        });
        return
    }
    new Content({
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content,
        user:req.userInfo._id.toString()
    }).save().then(()=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            msg:'内容保存成功',
            url:'/admin/content_index'
        });

    })

});

//修改内容
router.get('/content/edit',(req,res)=>{
    let id = req.query.id || '';
    let categories = [];
    Category.find().sort({_id:-1}).then((rs)=>{
        categories = rs;
       return Content.findOne({_id:id})
    }).then((content)=>{
            if(!content){
                res.render('admin/error',{
                    userInfo:req.userInfo,
                    msg:'制定内容不能为空'
                });
                return Promise.reject();
            }else {
                res.render('admin/content_edit',{
                    userInfo:req.userInfo,
                    content:content,
                    categoryList:categories
                });
            }
    })
})

//修改保存
router.post('/content/edit',(req, res, next)=>{
    let _id = req.query.id;
    const category = req.body.category;
    const title = req.body.title;
    const description = req.body.description;
    const content = req.body.content;
    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            msg: '文章所属栏目不能为空'
        });
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            msg: '文章标题不能为空'
        });
    }

    Content.update({_id},{category, title, description, content}).then(()=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '保存成功',
            url: `/admin/content/edit?id=${_id}`
        })
    });
});

router.get('/content/delete',(req, res, next)=>{
    let _id = req.query.id;
    Content.remove({_id}).then((delContent)=>{
        res.render('admin/success',{
            userInfo: req.userInfo,
            msg: '删除文章成功',
            url: '/admin/content'
        });
    });
});

module.exports = router;