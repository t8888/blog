const express = require('express');
const router = express.Router();
const  Category = require('../models/Category');
const  Content = require('../models/Content');

let data;
router.use(function (req,res,next) {
    data = {
        categories:[],
        userInfo:req.userInfo,
    };
    Category.find().then((categories)=>{
        data.categories = categories;
        next()
    })

})
router.get('/',(req,res,next)=>{
    Category.find().then(function (rs) {

        data.page=req.query.page || 1;
        data.categoryType = req.query.type || '';
        data.limit = 6;
        data.pages = 0;
        data.count = 0;
        data.contents = [];

        let where = {};
        if( data.categoryType != '' ) where.category = data.categoryType;

        Content.where( where ).count().then((count)=>{
            data.count = count;
            //计算总页数
            data.pages = Math.ceil(data.count/data.limit);
            //取值不能超过Pages
            data.page = Math.min(data.page,data.pages);
            //取值不能小于1
            data.page = Math.max(data.page,1);
            let skip = (data.page-1) * data.limit;

           return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({
               addTime:-1
           })
        }).then((contents)=>{
            data.contents = contents;
            res.render('main/index',data)
        })

    })

});

router.get('/views',(req, res, next)=>{
    const _id = req.query.page;
    Content.findOne({_id}).then((content)=>{

        content.views++;
        content.save();
        data.content = content;
        // console.log(data);
        res.render('main/detail',data);
    })

})



module.exports = router