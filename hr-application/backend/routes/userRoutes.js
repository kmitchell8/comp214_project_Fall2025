/*
 * File Name: userRoutes.js
 * Author(s): Kevon Mitchell    
 * Student ID (s): 301508202
 * Date: December 05, 2025
 */

const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/userController');

//Authentication Routes
//user registration
//router.post('/register', authCtrl.register); //access from authRoutes
//user Login
//router.post('/signin', authCtrl.signin); //accessed from authRoutes

//references CRUD in userController //used for ADMIN purposes
router.route('/')
    .post(authCtrl.requireSignin, /*authCtrl.isAdmin,*/ userCtrl.create)       // Equivalent to the old router.post('/')
    .get(authCtrl.requireSignin, /*authCtrl.isAdmin, */userCtrl.list)          // Equivalent to the old router.get('/')
    .delete(authCtrl.requireSignin, /*authCtrl.isAdmin, */userCtrl.removeAll); // Equivalent to the old router.delete('/')

router.route('/:userId')
    .get(authCtrl.requireSignin, userCtrl.read)// Equivalent to the old router.get('/:userID')
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)// Equivalent to the old router.put('/:userID')
    .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);// Equivalent to the old router.delete('/:userID')
    
module.exports = router;