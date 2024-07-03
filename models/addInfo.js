const { Schema, default: mongoose } = require("mongoose");

const degrees = ['Btech', 'MCA', 'Mtech'];
const branches = [
  'CSE', 'ECE', 'EEE', 'Mechanical', 'Chemical', 'Civil', 'Metallurgy', 'Biotechnology'
];

const addInfoSchema=new Schema({
    student:{
        type:mongoose.Schema.ObjectId,
        ref: 'student', 
        unique:'true',
        required: true
    },
    degree: {
        type: String,
        enum: degrees, 
        maxlength: 20,
        required: true
    },
    branch: {
        type: String,
        enum: branches,
        maxlength: 20,
        required: true
      },
      cgpa: {
        type: Number,
        required: true
      },
    work_place:{
        type:String,
        required:true
    },
    job_type:{
        type:String,
        required:true,
        default:null
    },
    role:{
        type:String,
        required:true
    },
    codechefUsername:{
        type:String,
        default:null
    },
    githubUsername:{
        type:String,
        default:null
    },
    codeforcesUsername:{
            type:String,
            default:null
    },
    gfgUsername:{
            type:String,
            default:null
    },
    leetcodeUsername:{
        type:String,
        default:null
    }
})

const addInfoModel=mongoose.model('addInfo',addInfoSchema);
module.exports=addInfoModel;
