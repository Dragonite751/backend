const mongoose = require('mongoose');
const { Schema } = mongoose;

const degrees = ['Btech', 'MCA', 'Mtech'];
const branches = [
  'CSE', 'ECE', 'EEE', 'Mechanical', 'Chemical', 'Civil', 'Metallurgy', 'Biotechnology'
];

const comapplySchema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Compann',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    required: true
  },
  name: {
    type: String,
    maxlength: 40,
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
  email: {
    type: String,
    required: true
  },
  roll_no: {
    type: String,
    maxlength: 10,
    required: true
  },
  shortlisted:{
    type: Boolean,
    default: false
  },
  resume:{
    type: Buffer,
    required: true
  }
});


const Comapply = mongoose.model('Comapply', comapplySchema);

module.exports = Comapply;
