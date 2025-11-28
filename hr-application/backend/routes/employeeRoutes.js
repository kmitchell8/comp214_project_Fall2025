/*
 * File Name: employeeRoutes.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */

const express = require('express');
const router = express.Router();
//const authCtrl = require('../controllers/authController'); //this app is built for future reference
//authController and userController are left in for future use
const employeeCtrl = require('../controllers/employeeController');


//references CRUD in employeeController //used for ADMIN purposes
router.route('/')
    .post(/*authCtrl.requireSignin, authCtrl.isAdmin, */employeeCtrl.create)       // Equivalent to the old router.post('/')
    .get(/*authCtrl.requireSignin, authCtrl.isAdmin, */employeeCtrl.list)          // Equivalent to the old router.get('/')
    .delete(/*authCtrl.requireSignin, authCtrl.isAdmin, */employeeCtrl.removeAll); // Equivalent to the old router.delete('/')

router.route('/:employeeId')
    .get(/*authCtrl.requireSignin, */employeeCtrl.read)// Equivalent to the old router.get('/:employeeID')
    .put(/*authCtrl.requireSignin, authCtrl.hasAuthorization, */employeeCtrl.update)// Equivalent to the old router.put('/:employeeID')
    .delete(/*authCtrl.requireSignin, authCtrl.hasAuthorization, */employeeCtrl.remove);// Equivalent to the old router.delete('/:employeeID')

module.exports = router;