const express=require("express");

// const { addInfo } = require("../controllers/studentController.js");
const checkuser = require("../middlewares/checkuser.js");
const route=express.Router();
const addInfoModel = require('../models/addInfo'); 
const studentModel = require('../models/student');
const multer = require('multer');
const path = require('path');
const { jobRecomend, getProfile, comPost, application, appliedStudents, companies, shortlistStudents, shortlisted } = require("../controllers/studentController.js");
const resumeModel = require("../models/resume.js");


// shortlisted
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage })
route.post('/addInfo', checkuser, async (req, res) => {
  const student = await studentModel.findById(req.user.id);
  try {
    const {
      role,
      degree,
      job_type,
      work_place,
      codechefUsername,
      githubUsername,
      codeforcesUsername,
      gfgUsername,
      leetcodeUsername,
      branch,
      cgpa
    } = req.body;

    if (!job_type || !work_place || !branch || !cgpa || !role || !degree) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (student.firstLogin) {
      const newInfo = new addInfoModel({
        student: req.user.id,
        degree,
        role,
        work_place,
        job_type,
        codechefUsername,
        githubUsername,
        codeforcesUsername,
        gfgUsername,
        leetcodeUsername,
        branch,
        cgpa
      });

      const savedInfo = await newInfo.save();
      
      
      res.status(200).json({ success: true, message: 'Information added successfully', data: savedInfo });
    } else {
      const updatedInfo = await addInfoModel.findOneAndUpdate(
        { student: req.user.id }, 
        {
          $set: {
            degree,
            role,
            work_place,
            job_type,
            codechefUsername,
            githubUsername,
            codeforcesUsername,
            gfgUsername,
            leetcodeUsername,
            branch,
            cgpa
          }
        }, 
        { new: true }
      );

      res.status(200).json({ success: true, message: 'Information updated successfully', data: updatedInfo });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

route.post("/addResume",upload.single('resume'), checkuser, async (req, res) => {
  try {
    const newResume=new resumeModel({
      student:req.user.id,
      resume: req.file ? req.file.buffer : null,
    })
    const resume= await newResume.save();
    await studentModel.updateOne(
      { _id: req.user.id }, 
      { $set: { firstLogin: false } } 
    );
    res.status(200).json({ success: true, message: 'Information added successfully', data: resume});

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});


route.get('/getInfo', checkuser, async (req, res) => {
  try {
    const student = await studentModel.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const info = await addInfoModel.findOne({ student: req.user.id });
    res.status(200).json({ success: true, firstLogin: student.firstLogin, info });
  } catch (error) {
    console.error('Error fetching student info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


route.get("/",(req,res)=>{
  res.send("hello");
})
route.get("/getjob",checkuser,jobRecomend)
route.get("/getProfile/:id?",checkuser,getProfile)
route.get("/appStu/:id",checkuser,appliedStudents)
route.post("/comPost",checkuser,comPost)
route.post("/comApply/:id",checkuser,application)
route.get("/comps",checkuser,companies)
route.post("/shortlist",checkuser,shortlistStudents)
route.get("/shortlisted",shortlisted)
module.exports=route;

