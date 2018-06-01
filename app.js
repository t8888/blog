const express = require('express');
const  swig = require('swig');
const  mongoose = require('mongoose');
const  app = express();
const  bodyParser = require('body-parser');
const Cookies = require('cookies');
const User = require('./models/User')

//设置静态托管
app.use('/public',express.static(__dirname + '/public'));
//使用body-paser 模块
app.use(bodyParser.urlencoded({extended:true}));
//设置cookies
app.use(function (req,res,next) {
    req.cookies = new Cookies(req,res);

    //解析登陆的cookies信息  并挂载在req对象上
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            //实时获取用户登陆的类型
            User.findById(req.userInfo._id).then((userInfo)=>{
                req.userInfo.isAdmin = userInfo.isAdmin;
                //console.log((req.userInfo))
                next()
            })

        }catch (e) {
            next()
        }
    }else{
        next()
    }

})
//定义模版引擎
app.engine('html',swig.renderFile);
//设置模版存放的目录
app.set('views','./views');
//注册所使用的模版引擎
app.set('view engine','html');
//取消模版缓存
swig.setDefaults({cache:false});

//分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

mongoose.connect('mongodb://localhost:27018/blog',(err)=>{
    if(err){
        console.log('数据库连接失败')
    }else {
        console.log("数据库连接成功");
        app.listen(8081);
    }
});

