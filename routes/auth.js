const express=require("express");
const route=express.Router();
const bcrypt=require('bcrypt');
const { body, validationResult } = require('express-validator');
const studentModel = require("../models/student");
const jwt = require('jsonwebtoken');
route.post(
    "/createStudent",
    [
        body('password', 'Password should be greater than 5 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const {email, password, password1,role,rollno,username} = req.body;
            console.log(req.body);
            if (!email || !password ||!password1 ||!role ||!rollno || !username){
                return res.status(400).json({ message: "Required fields are missing", success: false });
            }

            if (password !== password1) {
                return res.status(400).json({ message: "Both passwords should match", success: false });
            }

            const existingStudent = await studentModel.findOne({ email });
            if (existingStudent) {
                return res.status(400).json({ message: "Email already exists", success: false });
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const newUser = new studentModel({
                email:email,
                password: hash,
                rollno:rollno,
                role:role,
                username:username
            });
            console.log(newUser);
            await newUser.save();

            const student = await studentModel.findOne({ email });
            const payload = {
                id: student._id.toString(),
                role: role
            };

            const token = jwt.sign(
                payload,
                process.env.SECRET_TOKEN,
                { expiresIn: "2d" }
            );

            res.cookie('authCookie', token, {
                httpOnly: true,
                sameSite: "strict",
            });

            console.log("Cookie set successful");
            res.status(200).json({ message: "Account created", token, success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", success: false });
        }
    }
);



route.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log(req.body);
        
        console.log(req.cookies);
        if (!req.cookies) {
            return res.status(400).json({ message: "Cookies are not enabled", success: false });
        }

        if (req.headers.authorization || req.cookies.authCookie) {
            console.log(req.cookies.authCookie);
            return res.status(200).json({ message: "Already logged in", success: true });
        }

        const existingStudent = await studentModel.findOne({ email });
        if (!existingStudent) {
            return res.status(400).json({ message: "Username doesn't exist", success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, existingStudent.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Password doesn't match", success: false });
        }
        console.log(role);
        const payload = {
            id: existingStudent._id.toString(),
            role: existingStudent.role || 'student'
        };

        const token = jwt.sign(payload, process.env.SECRET_TOKEN, {
            expiresIn: "2d",
        });

        res.cookie("authCookie", token, {
            httpOnly: true,
            sameSite: "strict",
        });

        console.log("Cookie set successfully");
        return res.status(200).json({ message: "Login successful",role:role,token:token,student:existingStudent,success: true});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
});

module.exports = route;

  
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NDYzNzlhYTE5YzMzMGIwOWQ1MmViZCIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzE1ODc3Nzg2LCJleHAiOjE3MTYwNTA1ODZ9.n_0MCeLT_eQ5yp6UhG87_Mf0oWS-vdHooD6oQzTdRjI