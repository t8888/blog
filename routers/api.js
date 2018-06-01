const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
//统一返回格式
 var responseData;
router.use(function (req,res,next) {
    responseData = {
        code:0,
        message:''
    }
    next();
});

//用户注册
router.post('/user/register',(req,res,next)=>{
    // console.log('register');
    // console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空！';
        res.json(responseData);
        return
    }
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致！';
        res.json(responseData);
        return
    }
    if(password == ''){
        responseData.code = 2;
        responseData.message = '用户密码不能为空！';
        res.json(responseData);
        return
    }

    User.findOne({
        username: username
    }).then((userInfo)=>{
        // console.log('userInfo'+userInfo)
       if(userInfo){
           responseData.code = 4;
           responseData.message = '用户名已经被注册！';
           res.json(responseData);
           return
       }
       var user = new User({
           username:username,
           password:password
       });
       return user.save()
    }).then((userInfo)=>{
        req.cookies.set('userInfo',JSON.stringify({
            _id:userInfo._id,
            username:userInfo.username
        }));
        responseData.message = '注册成功';
        res.json(responseData);
    })



});

//登陆模块
router.post('/user/login',(req,res,next)=>{
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username:username}).then((userInfo)=>{
        if(!userInfo){
            responseData.code = 1;
            responseData.message = '用户不存在！';
            res.json(responseData);
            return
        }else if(userInfo.password != password){
            responseData.code = 2;
            responseData.message = '用户名密码错误！';
            res.json(responseData);
            return
        }else {
            responseData.message = '登陆成功';
            responseData.userInfo = {
                _id:userInfo._id,
                username:userInfo.username
            }
            req.cookies.set('userInfo',JSON.stringify({
                _id:userInfo._id,
                username:userInfo.username
            }));
            res.json(responseData);
        }
    })
})

//退出操作
router.use('/user/loginOut',(req,res,next)=>{
    req.cookies.set('userInfo',null);
    res.json(responseData);
})

router.post('/comment',(req, res, next)=>{
    // console.log(11111111111)
    const _id = req.body.commentId;
    const data = {
        userName: req.userInfo.username,
        postTime: new Date(),
        comment: req.body.commentContent
    };

    Content.findOne({_id}).then((content)=>{
        content.comments.push( data );
        return content.save();
    }).then((newContent)=>{
        // console.log(newContent.comments)
        responseData.msg = "评论成功";
        res.json({
            responseData,
            commentList: newContent.comments
        });
    }).catch(()=>{});
});

router.get('/comment',(req, res, next)=> {
    const _id = req.query.commentId || '';
    Content.findOne({_id}).then((content) => {

        responseData.msg = "获取成功";
        res.json({responseData, commentList: content.comments});
    })

})

module.exports = router