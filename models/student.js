const { default: mongoose, Schema } = require("mongoose");

const studentSchema=new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        sparse:true
    },
    rollno:{
        type:String,
        required:true,
        unique:true
    },
    firstLogin:{
        type:Boolean,
        default:true
    },
    role:{
        type:String,
        enum:["student","tnp"],
        required:true,
        default:"student"
    }
})

const studentModel=mongoose.model('student',studentSchema);
module.exports=studentModel;