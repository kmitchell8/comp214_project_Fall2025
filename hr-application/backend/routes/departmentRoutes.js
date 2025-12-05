/*
 * File Name: departmentRoutes.js
 * Author(s): Kevon Mitchell    
 * Student ID (s): 301508202
 * Date: December 05, 2025 
 */

const express = require('express');
const router = express.Router();
//const authCtrl = require('../controllers/authController'); //this app is built for future reference
//authController and userController are left in for future use
const departmentCtrl = require('../controllers/departmentController');
router.param('departmentId', departmentCtrl.departmentByID); //needed to ensure the id is being seen in the middleware routes

//references CRUD in departmentController //used for ADMIN purposes
router.route('/')
    .post(/*authCtrl.requireSignin, authCtrl.isAdmin, */departmentCtrl.create)       // Equivalent to the old router.post('/')
    .get(/*authCtrl.requireSignin, authCtrl.isAdmin, */departmentCtrl.list)          // Equivalent to the old router.get('/')
    .delete(/*authCtrl.requireSignin, authCtrl.isAdmin, */departmentCtrl.removeAll); // Equivalent to the old router.delete('/')

router.route('/:departmentId')
    .get(/*authCtrl.requireSignin, */departmentCtrl.read)// Equivalent to the old router.get('/:departmentID')
    .put(/*authCtrl.requireSignin, authCtrl.hasAuthorization, */departmentCtrl.update)// Equivalent to the old router.put('/:departmentID')
    .delete(/*authCtrl.requireSignin, authCtrl.hasAuthorization, */departmentCtrl.remove);// Equivalent to the old router.delete('/:departmentID')

module.exports = router;