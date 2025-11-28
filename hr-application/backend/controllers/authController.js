/*
 * File Name: authController.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */

//const express = require('express');
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt');
const oracledb = require('oracledb'); 
const { executeQuery, hashPassword, comparePassword } = require('../db'); 

// The name of your user table and sequence (assuming a sequence for USER_ID generation)
const USER_TABLE = 'USERS'; //Need to be defined in sql
const USER_ID_SEQUENCE = 'USER_ID_SEQ'; //Need to be defined in Oracle SQL //reference explainer
// Define config 
const config = {
    jwtSecret: process.env.JWT_SECRET
};


//Register
 
const register = async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
    
        const checkSql = `SELECT user_id FROM ${USER_TABLE} WHERE email = :email`;
        const existingUser = await executeQuery(checkSql, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        
        const hashedPassword = await hashPassword(password);

        //insert the new user and return the generated ID
        const insertSql = `
            INSERT INTO ${USER_TABLE} (user_id, username, email, password, role) 
            VALUES (${USER_ID_SEQUENCE}.NEXTVAL, :username, :email, :password_hash, 'user')
            RETURNING user_id INTO :id
        `;
        
        const bindParams = {
            username: username,
            email: email,
            password_hash: hashedPassword, 
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
        };
        
        const result = await executeQuery(insertSql, bindParams, { 
            autoCommit: true, 
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });
        
        //The generated ID is in result.outBinds.id[0]
        const newUserId = result.outBinds.id[0];

        //Send back a sanitized user object
        res.status(201).json({ 
            user: { 
                USER_ID: newUserId, 
                EMAIL: email, 
                USERNAME: username,
                ROLE: 'user'
            },
            message: 'User registered successfully.'
        });

    } catch (err) {
        console.error('Oracle Registration Error:', err);
        //Handle constraint violations or other SQL errors
        res.status(500).json({ error: "Registration failed due to a server error: " + err.message });
    }
};

//Login
const signin = async (req, res) => {
    console.log('Test log in authController/signin: Starting signin process...');
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const sql = `
            SELECT USER_ID, USERNAME, EMAIL, PASSWORD, ROLE 
            FROM ${USER_TABLE} 
            WHERE EMAIL = :email
        `; //select user by email
        
        const result = await executeQuery(sql, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        
        const passwordMatch = await comparePassword(password, user.PASSWORD);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Email and password don't match." });
        }
        
        const token = jwt.sign({ USER_ID: user.USER_ID, role: user.ROLE, email: user.EMAIL }, config.jwtSecret);

        res.cookie('t', token, { httpOnly: true, maxAge: 99990000 });

        //removes sensitive user data
        const userObject = { ...user };
        delete userObject.PASSWORD; 

        return res.json({
            token,
            user: userObject
        });

    } catch (err) {
        console.error('Oracle Signin Error:', err);
        return res.status(500).json({ error: "Could not sign in: " + err.message });
    }
};

//clears cookie on signout
const signout = (req, res) => {
    res.clearCookie("t");
    return res.status(200).json({ message: "signed out" });
};


//Middleware
//requireSignin
const requireSignin = expressjwt({
    secret: config.jwtSecret,
    userProperty: 'auth', // Attaches decoded JWT payload to req.auth
    algorithms: ['HS256'] 
});


//hasAuthorization
const hasAuthorization = (req, res, next) => {
    //req.profile comes from a user-specific lookup route/middleware (not shown here)
    //We check if the profile ID (from the URL/lookup) matches the auth ID (from the token)
    const isOwner = req.profile && req.auth &&
        (req.profile.USER_ID.toString() === req.auth.USER_ID.toString());
        
    //Check for admin role
    const isAdmin = req.auth && req.auth.role === 'admin';
    
    const authorized = isOwner || isAdmin;
    
    if (!(authorized)) {
        return res.status(403).json({
            error: "User is not authorized"
        });
    }
    next();
};

module.exports = {
    register,
    signin,
    signout,
    requireSignin,
    hasAuthorization
};