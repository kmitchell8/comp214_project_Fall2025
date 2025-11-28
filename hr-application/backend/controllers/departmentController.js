/*
 * File Name: departmentController.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */



const oracledb = require('oracledb'); //Needed for binding options
const _ = require('lodash'); //Used for cleaning up request bodies
const { executeQuery } = require('../db'); //Import Oracle DB utilities 

//Define the name of your department table
const DEPARTMENT_TABLE = 'HR_departments';



//Middleware to pre-load department based on the 'departmentId' parameter in the route.

const departmentByID = async (req, res, next, id) => {
    try {
        //SQL to select the department by DEPARTMENT_ID.
        const sql = `
            SELECT DEPARTMENT_ID, DEPARTMENT_NAME, MANAGER_ID, LOCATION_ID
            FROM ${DEPARTMENT_TABLE} 
            WHERE DEPARTMENT_ID = :id
        `;
        const result = await executeQuery(sql, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const department = result.rows[0];

        if (!department) {
            return res.status(404).json({
                error: "Department not found"
            });
        }

        //Attach the found department object to the request.
        req.department = department;
        next();
    } catch (err) {
        console.error('Oracle departmentByID Error:', err);
        return res.status(400).json({
            error: "Could not retrieve department: " + err.message
        });
    }
};

//Single Department CRUD Operations 

//GET: Read the profile data of the department loaded by departmentByID
const read = (req, res) => {
    // req.department already contains the department data
    return res.json(req.department);
};

//PUT: Update department data
const update = async (req, res, next) => {
    //Collect updates from the request body. Only update fields defined in schema.
    const allowedUpdates = {
        department_id: req.body.department_id,
        department_title: req.body.department_name,
        manager_id: req.body.manager_id,
        location_id: req.body.location_id
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
        bindParams.id = req.department.DEPARTMENT_ID;

        const updateSql = `
            UPDATE ${DEPARTMENT_TABLE} 
            SET ${updateSqlParts.join(', ')} 
            WHERE DEPARTMENT_ID = :id
        `;

        await executeQuery(updateSql, bindParams, { autoCommit: true });

        //Retrieve the updated department data to send back
        const readSql = `
            SELECT DEPARTMENT_ID, DEPARTMENT_NAME, MANAGER_ID, LOCATION_ID
            FROM ${DEPARTMENT_TABLE} 
            WHERE DEPARTMENT_ID = :id
        `;
        const result = await executeQuery(readSql, [req.department.DEPARTMENT_ID], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Oracle Update Error:', err);
        return res.status(400).json({
            error: "Could not update department: " + err.message
        });
    }
};

//DELETE: Remove the department
const remove = async (req, res, next) => {
    try {
        const departmentId = req.department.DEPARTMENT_ID;

        const deleteSql = `DELETE FROM ${DEPARTMENT_TABLE} WHERE DEPARTMENT_ID = :id`;
        const result = await executeQuery(deleteSql, [departmentId], { autoCommit: true });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Department not found for deletion." });
        }

        // Return a confirmation message
        res.json({ message: `Department ${departmentId} successfully deleted.` });

    } catch (err) {
        console.error('Oracle Delete Error:', err);
        return res.status(400).json({
            error: "Could not delete department: " + err.message
        });
    }
};


//General Operations

//POST: Create a new department
const create = async (req, res) => {
    try {
        // Construct the INSERT statement
        const sql = `
            INSERT INTO ${DEPARTMENT_TABLE} (
                DEPARTMENT_ID, DEPARTMENT_NAME, MANAGER_ID, LOCATION_ID
            ) VALUES (
                :department_id, :department_name, :manager_id, :location_id
            )
        `;

        //Bind parameters from request body
        const binds = {
            department_id: req.body.department_id, // Assuming ID is passed or use a sequence in SQL
            department_title: req.body.department_name,
            manager_id: req.body.manager_id,
            location_id: req.body.location_id
        };

        await executeQuery(sql, binds, { autoCommit: true });

        res.status(201).json({ message: "Department created successfully." });

    } catch (err) {
        console.error('Oracle Create Error:', err);
        return res.status(400).json({
            error: "Could not create department: " + err.message
        });
    }
};

//GET: List all departments
const list = async (req, res) => {
    try {
        const sql = `
            SELECT DEPARTMENT_ID, DEPARTMENT_NAME, MANAGER_ID, LOCATION_ID
            FROM ${DEPARTMENT_TABLE} 
            ORDER BY DEPARTMENT_ID
        `;
        //Fetch all departments
        const result = await executeQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Oracle List Error:', err);
        res.status(500).json({ message: err.message });
    }
};

//DELETE: Delete all departments
const removeAll = async (req, res) => {
    try {
        const sql = `DELETE FROM ${DEPARTMENT_TABLE}`;
        const result = await executeQuery(sql, [], { autoCommit: true });

        res.status(200).json({ message: `Successfully deleted ${result.rowsAffected} department(s).` });
    } catch (err) {
        console.error('Oracle RemoveAll Error:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    departmentByID,
    read,
    update,
    remove,
    create,
    list,
    removeAll
};