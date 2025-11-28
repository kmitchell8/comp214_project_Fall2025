/*
 * File Name: server.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */

//import express from 'express'; //using tpye: "module"
const express = require('express');//using type="commonjs"
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { initialize, closePool } = require('./db');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//API Routes

//const contactRoutes = require('./routes/contactRoutes'); //future reference
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const jobRoutes = require('./routes/jobRoutes');

//MIDDLEWARE

app.use(cors());
app.use(express.json());
app.use(cookieParser());
//app.use(bodyParser.json());  //handled by express.json
//enabling the API routes
//app.use('/api/contacts', contactRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);

app.get('/', (req, res,) => {
    res.status(200).json({ "message": "Any message indicating the server is working" }); //may not be necessary once front end is established
});

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ "error": err.name + ": " + err.message })
    } else if (err) {
        res.status(400).json({ "error": err.name + ": " + err.message })
        console.log(err)
    }
})


//ORACLE_DB Connection
async function startServer() {
    try {
        // Initialize the Oracle Connection Pool 
        await initialize();

        // Start listening for HTTP requests
        server = app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
            //console.log(`Contacts are visible at http://localhost:${PORT}${'/api/contacts'}`);
            console.log(`Departments are visible at http://localhost:${PORT}${'/api/departments'}`);
            console.log(`Employees are visible at http://localhost:${PORT}${'/api/employees'}`);
            console.log(`Jobs are visible at http://localhost:${PORT}${'/api/jobs'}`);
            console.log(`Users are visible at http://localhost:${PORT}${'/api/users'}`);
            console.log(`Authentications are visible at http://localhost:${PORT}${'/api/auth'}`);
        })
    } catch (error) {
        // If initialize() failed, the process already exited (see db.js)
        console.error("Server startup failed due to database connection issue.");
    }
}

function handleShutdown() {
    server.close(async () => {
        console.log('HTTP server closed.');
        await closePool();
        process.exit(0);
    });
}

// Listen for termination signals (Ctrl+C, kill command)
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
//START SERVER call
startServer();


