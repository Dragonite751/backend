const express = require('express');
const router = express.Router();
const addInfoModel = require('../models/addInfo');
const pdfParse = require('pdf-parse');
const Compann = require('../models/compAnn');
const studentModel = require('../models/student');
const resumeModel = require('../models/resume');
const Comapply = require('../models/comApply');
// Comapply
// resumeModel

// Compann

const knownSkills = [
    "Python", "Java", "JavaScript", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin",
    "HTML", "CSS", "React", "Angular", "NodeJS", "ExpressJS", "SQL", "MySQL",
    "PostgreSQL", "MongoDB", "Redis", "Django", "Flask", "Ruby on Rails", "Spring Boot",
    ".NET Core", "TensorFlow", "PyTorch", "Keras", "Scikit-Learn", "Natural Language Processing",
    "NLP", "Computer Vision", "Reinforcement Learning", "Deep Learning", "Machine Learning Algorithms",
    "Data Engineering", "Big Data Analytics", "Data Warehousing", "ETL (Extract, Transform, Load)",
    "AWS", "Azure", "Google Cloud", "Kubernetes", "Docker", "Jenkins", "Ansible", "Terraform",
    "React", "Vue.js", "Redux", "VueX", "HTML5", "CSS3", "Responsive Web Design", "Kotlin",
    "Java", "iOS", "Swift", "Selenium", "JUnit", "TestNG", "Linux", "Unix", "Windows",
    "Tableau", "Power BI", "Matplotlib", "Seaborn", "Data Analytics", "Business Intelligence",
    "Communication", "Problem Solving", "Teamwork", "Leadership", "Adaptability", "AutoCAD",
    "SolidWorks", "CATIA", "MATLAB", "ANSYS", "Thermodynamics", "Fluid Mechanics",
    "Mechanical Design", "Finite Element Analysis", "CAD", "CAM", "Heat Transfer",
    "Manufacturing Processes", "Machine Design", "Structural Analysis", "Control Systems",
    "Robotics", "Materials Science", "Mechatronics", "HVAC", "CNC Machining", "Welding",
    "Machining", "Product Design", "MERN", "Mern"
];


function extractSkills(text) {
    const lowerCaseText = text.toLowerCase();
    const matchedSkills = [];

    knownSkills.forEach(skill => {
        if (lowerCaseText.includes(skill.toLowerCase())) {
            matchedSkills.push(skill);
        }
    });

    return matchedSkills;
}



const extractTextFromPDFBuffer = async (pdfBuffer) => {
    try {
        const data = await pdfParse(pdfBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF buffer:', error);
        throw error;
    }
};

// fetchResume function
const jobRecomend = async (req, res) => {
    try {

        const userId = req.user.id;
        const info = await addInfoModel.findOne({ student: userId });
        const resume = await resumeModel.findOne({ student: userId });

        if (!info || !resume.resume) {
            return res.status(404).json({ success: false, message: 'info not found' });
        }

        const text = await extractTextFromPDFBuffer(resume.resume);

        console.log(info.job_type);
        console.log(info.work_place);
        console.log(info.role);
       
        console.log(text);
        const response = await fetch('https://skillapi.onrender.com/recommend_jobs/', {
            method: 'POST',
            body: JSON.stringify({
                deg: info.role,
                city: info.work_place,
                role: info.job_type,
                country: "India",
                restext: text
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': 'true',
            },
        });

        const responseData = await response.json();
        // console.log(responseData);
        res.status(200).json({ success: true, jobs: responseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
const fetchStudentData = async (userId) => {
    const student = await studentModel.findById(userId);
    const info = await addInfoModel.findOne({ student: userId });
    const resume = await resumeModel.findOne({ student: userId });
    return { student, info, resume };
};

const validateData = (info, resume) => {
    if (!info || !resume.resume) {
        throw new Error('Info or resume not found');
    }
};

const fetchPlatformData = async (platforms) => {
    const platformData = {};

    for (const { platform, username } of platforms) {
        if (username) {
            try {
                const response = await fetch('https://profileapi.onrender.com/get_info/', {
                    method: 'POST',
                    body: JSON.stringify({ username, platform }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Credentials': 'true',
                    },
                });
                const data = await response.json();
                platformData[platform] = data;
            } catch (apiError) {
                console.error(`Error fetching data for ${platform}:`, apiError);
                platformData[platform] = `Error fetching data for ${platform}`;
            }
        } else {
            platformData[platform] = 'username not provided';
        }
    }

    return platformData;
};

const getProfile = async (req, res) => {
    try {
        let userId = req.params.id && req.params.id !== "undefined" ? req.params.id : req.user.id;
        console.log(userId);
        const { student, info, resume } = await fetchStudentData(userId);

        validateData(info, resume);

        const text = await extractTextFromPDFBuffer(resume.resume);
        const skills = extractSkills(text);

        const stuinfo = {
            skills,
            info,
            pinfo: student,
        };

        const platforms = [
            { platform: 'codechef', username: info.codechefUsername },
            { platform: 'gfg', username: info.gfgUsername },
            { platform: 'github', username: info.githubUsername },
            { platform: 'leetcode', username: info.leetcodeUsername },
            { platform: 'codeforces', username: info.codeforcesUsername }
        ];

        const platformData = await fetchPlatformData(platforms);

        res.status(200).json({ success: true, message: { ...stuinfo, ...platformData, resume: resume } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};


const comPost = async (req, res) => {
    try {

        const userId = req.user.id;
        console.log(req.user.role);
        if (req.user.role !== "tnp") {
            return res.status(403).json({ success: false, message: 'Only tnps can post job' });
        }
        const { company_name, offer_type, eligible_branches, eligibility_criteria, job_title, salary, deadline, jd } = req.body;

        if (!company_name || !offer_type || !eligible_branches || !eligibility_criteria || !job_title || !salary || !deadline) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const newJob = new Compann({
            company_name,
            offer_type,
            eligible_branches,
            eligibility_criteria,
            job_title,
            salary,
            deadline: new Date(deadline),
            jd,
            spoc: userId
        });
        await newJob.save();
        return res.status(201).json({ success: true, message: 'Job posted successfully', data: newJob });
    } catch (error) {
        console.error('Error posting job:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
const application = async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.user.id;
        console.log(userId)
        const student = await studentModel.findById(userId);
        const info = await addInfoModel.findOne({ student: userId });
        const resume = await resumeModel.findOne({ student: userId });
        const company = await Compann.findById(req.params.id); 
        if (!student || !info || !resume || !company) {
            return res.status(404).json({ success: false, message: 'Student, additional info, resume, or company not found' });
        }

        const newApplication = new Comapply({
            student: req.user.id,
            company: req.params.id,
            name: student.username,
            degree: info.degree,
            branch: info.branch,
            cgpa: info.cgpa,
            email: student.email,
            roll_no: student.rollno,
            resume: resume.resume,
            shortlisted: false
        });

        await newApplication.save();
        company.applications.push(newApplication._id);
        company.students_applied.push(student._id);
        await company.save();

        return res.status(201).json({ success: true, message: 'Application submitted successfully', application: newApplication });
    } catch (error) {
        console.error('Error submitting application:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = application;


const appliedStudents = async (req, res) => {
    // console.log(req);
    const companyId  = req.params.id;
    console.log(companyId);
    if (!companyId){
        return res.status(400).json({ success: false, message: 'Company ID is required' });
    }
    try {
        const company = await Compann.findById(companyId)
            .populate('students_applied')
            .populate('students_placed');
        res.status(200).json({
            success: true,
            students_applied: company.students_applied,
            students_placed: company.students_placed,
        });
    } catch (error) {
        console.error('Error shortlisting student:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const shortlistStudents = async (req, res) => {
    const { companyId, students } = req.body;
    console.log(req.body);
    const userRole = req.user.role;

    if (!companyId || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'Company ID and a list of Student IDs are required' });
    }
    if (userRole !== 'tnp') {
        return res.status(403).json({ success: false, message: 'Only tnps are allowed to shortlist' });
    }
    try {
        const company = await Compann.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        let placedStudents = [];
        let errors = [];

        for (let studentId of students) {
            try {
                const student = await studentModel.findById(studentId);
                if (!student) {
                    errors.push({ studentId, message: 'Student not found' });
                    continue;
                }
                if (company.students_placed.includes(studentId)) {
                    errors.push({ studentId, message: 'Student already placed' });
                    continue;
                }
                const appliedIndex = company.students_applied.indexOf(studentId);
                if (appliedIndex !== -1) {
                    company.students_applied.splice(appliedIndex, 1);
                }
                company.students_placed.push(studentId);
                placedStudents.push(studentId);
            } catch (error) {
                errors.push({ studentId, message: 'Error processing student', error: error.message });
            }
        }

        await company.save();
        res.status(201).json({
            success: true,
            message: 'Students processed',
            placedStudents,
            errors,
            data: company
        });
    } catch (error) {
        console.error('Error shortlisting students:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const companies=async (req, res) => {
    try {
      const user = await studentModel.findById(req.user.id);
      const companies = await Compann.find({}).populate('spoc','name email');
      const comp=companies.filter((company) => !company.students_applied.includes(req.user.id));
      res.status(200).json({ success: true, comps: comp,role:user.role});
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }   
  };
const shortlisted=async (req,res)=>{
    const { companyId, students } = req.body;
    try {
        const company = await Compann.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        return res.status(400).json({ success: true, message: company.students_placed });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


module.exports = { getProfile, jobRecomend, comPost, application, appliedStudents,shortlistStudents,companies,shortlisted};

