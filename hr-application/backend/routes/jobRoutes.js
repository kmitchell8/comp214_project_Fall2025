/*
 * File Name: jobRoutes.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */

const express = require('express');
const router = express.Router();
//const authCtrl = require('../controllers/authController'); //this app is built for future reference
                                                            //authController and userController are left in for future use
const jobCtrl = require('../controllers/jobController');
router.param('jobId', jobCtrl.jobByID); //needed to ensure the id is being seen in the middleware routes

//references CRUD in jobController //used for ADMIN purposes
router.route('/')
    .post(/*authCtrl.requireSignin, authCtrl.isAdmin, */jobCtrl.createWithProcedure)       // Equivalent to the old router.post('/')
    .get(/*authCtrl.requireSignin, authCtrl.isAdmin, */jobCtrl.list)          // Equivalent to the old router.get('/')
    .delete(/*authCtrl.requireSignin, authCtrl.isAdmin, */jobCtrl.removeAll); // Equivalent to the old router.delete('/')

router.route('/:jobId')
    .get(/*authCtrl.requireSignin, */jobCtrl.read)// Equivalent to the old router.get('/:jobID')
    .put(/*authCtrl.requireSignin, authCtrl.hasAuthorization, */jobCtrl.update)// Equivalent to the old router.put('/:jobID')
    .delete(/*authCtrl.requireSignin, authCtrl.hasAuthorization, */jobCtrl.remove);// Equivalent to the old router.delete('/:jobID')

    module.exports = router;