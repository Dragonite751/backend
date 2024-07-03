const express = require('express')
const dbconn = require('./config/db')
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const app = express()
const cors=require('cors');
const cookieparser=require('cookie-parser')
app.use(cookieparser());
const port = 3001

app.use(express.json());
dbconn()  
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use("/auth",authRoutes)
app.use("/stu",studentRoutes)
