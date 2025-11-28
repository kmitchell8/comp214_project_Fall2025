/*
 * File Name: employeeController.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */


const oracledb = require('oracledb'); //Needed for binding options
const _ = require('lodash'); //Used for cleaning up request bodies
const { executeQuery } = require('../db'); //Import Oracle DB utilities 

//Define the name of your employee table
const EMPLOYEE_TABLE = 'HR_employees'; 

//Core Parameter Middleware

//Middleware to pre-load an employee based on the 'employeeId' parameter in the route.
 
const employeeByID = async (req, res, next, id) => {
    try {
        // SQL to select the employee by EMPLOYEE_ID.
        const sql = `
            SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, 
                   HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID
            FROM ${EMPLOYEE_TABLE} 
            WHERE EMPLOYEE_ID = :id
        `;
        const result = await executeQuery(sql, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        const employee = result.rows[0];

        if (!employee) {
            return res.status(404).json({
                error: "Employee not found"
            });
        }
        
        //Attach the found employee object to the request.
        req.employee = employee;
        next();
    } catch (err) {
        console.error('Oracle employeeByID Error:', err);
        return res.status(400).json({
            error: "Could not retrieve employee: " + err.message
        });
    }
};

//Single Employee CRUD Operations

//GET: Read the profile data of the employee loaded by employeeByID
const read = (req, res) => {
    //req.employee already contains the employee data
    return res.json(req.employee);
};

//PUT: Update employee data
const update = async (req, res, next) => {
    //Collect updates from the request body. Only update fields defined in schema.
    const allowedUpdates = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        hire_date: req.body.hire_date,
        job_id: req.body.job_id,
        salary: req.body.salary,
        commission_pct: req.body.commission_pct,
        manager_id: req.body.manager_id,
        department_id: req.body.department_id
    };

    //Filter out undefined/null values
    const updates = _.pickBy(allowedUpdates, _.identity); 

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields provided for update." });
    }

    try {
        let updateSqlParts = [];
        let bindParams = {};
        let bindCount = 1;

        //Process field updates
        for (const [key, value] of Object.entries(updates)) {
            const paramName = `p${bindCount++}`;
            updateSqlParts.push(`${key.toUpperCase()} = :${paramName}`);
            bindParams[paramName] = value;
        }

        //Add the WHERE clause
        bindParams.id = req.employee.EMPLOYEE_ID;

        const updateSql = `
            UPDATE ${EMPLOYEE_TABLE} 
            SET ${updateSqlParts.join(', ')} 
            WHERE EMPLOYEE_ID = :id
        `;
        
        await executeQuery(updateSql, bindParams, { autoCommit: true });

        //Retrieve the updated employee data to send back
        const readSql = `
            SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, 
                   HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID
            FROM ${EMPLOYEE_TABLE} 
            WHERE EMPLOYEE_ID = :id
        `;
        const result = await executeQuery(readSql, [req.employee.EMPLOYEE_ID], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        res.json(result.rows[0]);

    } catch (err) {
        console.error('Oracle Update Error:', err);
        return res.status(400).json({
            error: "Could not update employee: " + err.message
        });
    }
};

//DELETE: Remove the employee
const remove = async (req, res, next) => {
    try {
        const employeeId = req.employee.EMPLOYEE_ID; 
        
        const deleteSql = `DELETE FROM ${EMPLOYEE_TABLE} WHERE EMPLOYEE_ID = :id`;
        const result = await executeQuery(deleteSql, [employeeId], { autoCommit: true }); 

        if (result.rowsAffected === 0) {
             return res.status(404).json({ error: "Employee not found for deletion." });
        }
        
        //Return a confirmation message
        res.json({ message: `Employee ${employeeId} successfully deleted.`});

    } catch (err) {
        console.error('Oracle Delete Error:', err);
        return res.status(400).json({
            error: "Could not delete employee: " + err.message
        });
    }
};


//General Operations

//POST: Create a new employee
const create = async (req, res) => {
    try {
        // Construct the INSERT statement
        const sql = `
            INSERT INTO ${EMPLOYEE_TABLE} (
                EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, 
                HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID
            ) VALUES (
                :employee_id, :first_name, :last_name, :email, :phone_number,
                :hire_date, :job_id, :salary, :commission_pct, :manager_id, :department_id
            )
        `;

        //Bind parameters from request body
        const binds = {
            employee_id: req.body.employee_id, //Assuming ID is passed or you can use a sequence in SQL
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            hire_date: req.body.hire_date ? new Date(req.body.hire_date) : new Date(), //Default to now if empty
            job_id: req.body.job_id,
            salary: req.body.salary,
            commission_pct: req.body.commission_pct,
            manager_id: req.body.manager_id,
            department_id: req.body.department_id
        };

        await executeQuery(sql, binds, { autoCommit: true });

        res.status(201).json({ message: "Employee created successfully." });

    } catch (err) {
        console.error('Oracle Create Error:', err);
        return res.status(400).json({
            error: "Could not create employee: " + err.message
        });
    }
};

//GET: List all employees
const list = async (req, res) => {
    try {
        const sql = `
            SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, 
                   HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID
            FROM ${EMPLOYEE_TABLE} 
            ORDER BY EMPLOYEE_ID
        `;
        //Fetch all employees
        const result = await executeQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Oracle List Error:', err);
        res.status(500).json({ message: err.message });
    }
};

//DELETE: Delete all employees
const removeAll = async (req, res) => {
    try {
        const sql = `DELETE FROM ${EMPLOYEE_TABLE}`;
        const result = await executeQuery(sql, [], { autoCommit: true }); 
        
        res.status(200).json({ message: `Successfully deleted ${result.rowsAffected} employee(s).` });
    } catch (err) {
        console.error('Oracle RemoveAll Error:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    employeeByID, 
    read,
    update,
    remove,
    create, 
    list,
    removeAll
};