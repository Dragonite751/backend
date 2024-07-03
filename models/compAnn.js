const mongoose = require('mongoose');
const { Schema } = mongoose;

const compannSchema = new Schema({
    company_name: {
        type: String,
        required: true
    },
    offer_type: {
        type: String,
        required: true
    },
    eligible_branches: {
        type: String,
        required: true
    },
    eligibility_criteria: {
        type: String,
       
        required: true
    },
    job_title: {
        type: String,
     
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    jd: {
        type: String,
        maxlength: 300,
        required: false
    },
    spoc: {
        type: String,
        required: true
    },
    students_applied: [{
        type: mongoose.Schema.ObjectId,
        ref: 'student'
    }],
    students_placed: [{
        type: mongoose.Schema.ObjectId,
        ref: 'student'
    }],
    applications:[{
        type: mongoose.Schema.ObjectId,
        ref: 'comApply'
    }]
});

// Create a model using the schema
const Compann = mongoose.model('Compann', compannSchema);

module.exports = Compann;
