/*
 * File Name: server.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */

const express = require('express');
const router = express.Router();
//const User = require('../models/users');
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/userController');
//import { requireSignin } from '../controllers/authController';

//Authentication Routes
//user registration
//router.post('/register', authCtrl.register); //access from authRoutes
//user Login
//router.post('/signin', authCtrl.signin); //accessed from authRoutes

//references CRUD in userController //used for ADMIN purposes
router.route('/')
    .post(authCtrl.requireSignin, authCtrl.isAdmin,userCtrl.create)       // Equivalent to the old router.post('/')
    .get(authCtrl.requireSignin, authCtrl.isAdmin,userCtrl.list)          // Equivalent to the old router.get('/')
    .delete(authCtrl.requireSignin, authCtrl.isAdmin,userCtrl.removeAll); // Equivalent to the old router.delete('/')

router.route('/:userId')
    .get(authCtrl.requireSignin, userCtrl.read)// Equivalent to the old router.get('/:userID')
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)// Equivalent to the old router.put('/:userID')
    .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);// Equivalent to the old router.delete('/:userID')