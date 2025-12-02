/*
 * File Name: employeeController.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */


const oracledb = require('oracledb'); //Needed for binding options //cannot be accessed in the scope of this program
//I will leave it for future use however it is explicitly called in employeeByID to resolve that access issue
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
        //const result = await executeQuery(sql, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        //had to put require('oracledb') inside the function as the global variable was not being accessed.
        const result = await executeQuery(sql, [id], { outFormat: require('oracledb').OUT_FORMAT_OBJECT });

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
        return res.status(500).json({
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
        EMAIL: req.body.EMAIL,
        PHONE_NUMBER: req.body.PHONE_NUMBER,
        SALARY: req.body.SALARY,
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
            // updateSqlParts.push(`${key.toUpperCase()} = :${paramName}`);//redundant after formatting "allowedupdates" but i'll leave it in
            updateSqlParts.push(`${key} = :${paramName}`);
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
        if (err.message.includes('-20100')) {//Catch trigger error
            const triggerErroMsg = err.message.split('ORA-20100:')[1].trim();//storing the error message
            return res.status(400).json({
                error: "Validation Error",
                details: triggerErroMsg
            })
        }
        console.error('Oracle Update Error:', err);
        return res.status(500).json({
            error: "Could not update employee"
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
        res.json({ message: `Employee ${employeeId} successfully deleted.` });

    } catch (err) {
        console.error('Oracle Delete Error:', err);
        return res.status(500).json({
            error: "Could not delete employee"
        });
    }
};


//General Operations

//POST: Create a new employee
const create = async (req, res) => {
    try {
        // Construct the INSERT statement
        const sql = `
      BEGIN employee_hire_sp(
        :p_first_name, :p_last_name, :p_email, :p_phone_number,
        :p_hire_date, :p_job_id, :p_salary, :p_commission_pct,
        :p_manager_id, :p_department_id
      ); END;
    `;

        //Bind parameters from request body
        const binds = {
            p_first_name: req.body.firstName || req.body.first_name,
            p_last_name: req.body.lastName || req.body.last_name,
            p_email: req.body.email,
            p_phone_number: req.body.phone || req.body.phone_number,
            p_hire_date: req.body.hireDate ? new Date(req.body.hireDate) : new Date(),  //Default to now if empty
            p_job_id: req.body.jobId || req.body.job_id,
            p_salary: req.body.salary,
            p_commission_pct: req.body.commission_pct || null,
            p_manager_id: req.body.managerId || req.body.manager_id,
            p_department_id: req.body.departmentId || req.body.department_id
        };

        await executeQuery(sql, binds, { autoCommit: true });

        res.status(201).json({ message: "Employee hired successfully." });

    } catch (err) {//retain code for future use in implimenting triggers in an express envrioinment
        if (err.message.includes('-20100')) {//Catch trigger error
            const triggerErroMsg = err.message.split('ORA-20100:')[1].trim();//storing the error message
            return res.status(400).json({
                error: "Validation Error",
                details: triggerErroMsg
            })
        }
        console.error('Oracle Create Error:', err);
        return res.status(500).json({
            error: "Could not hire employee, please try again."
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