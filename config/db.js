
const mongoose=require('mongoose')
require('dotenv').config();
const dbconn= async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("database connected");
    } catch (error) {
        console.log("There is some problem in establishing connection with database");
    }
}
module.exports=dbconn;
