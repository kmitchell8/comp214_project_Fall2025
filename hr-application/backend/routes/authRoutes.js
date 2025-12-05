/*
 * File Name: authRotes.js
 * Author(s): Kevon Mitchell    
 * Student ID (s): 301508202
 * Date: December 05, 2025
 */


//import express from 'express'; //using tpye: "module"
const express = require('express');//using type="commonjs"
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.route('/signin').post(authCtrl.signin);
router.route('/signout').get(authCtrl.signout);
router.route('/register').post(authCtrl.register); //Creates User can be accessed from userRoutes

module.exports =  router;
