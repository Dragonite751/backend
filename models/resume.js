const { default: mongoose } = require("mongoose");

const resumeSchema=new mongoose.Schema({
    student:{
        type:mongoose.Schema.ObjectId,
        ref: 'student',
        required: true
    },
    resume:{
        type:Buffer,
        default:null
    }
})

const resumeModel=mongoose.model('resume',resumeSchema);
module.exports=resumeModel;
