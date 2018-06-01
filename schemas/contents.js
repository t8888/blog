const  mongoose = require('mongoose');
//定义用户表结构

module.exports = new mongoose.Schema({
    // _id:String,
    title:String,
    addTime:{
       type:Date,
       default:new Date()
    },
    views:{
        type:Number,
        default:0
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    description:{
        type:String,
        default:''
    },
    content:{
        type:String,
        default:''
    },
    comments:{
        type:Array,
        default:[]
    }

})
