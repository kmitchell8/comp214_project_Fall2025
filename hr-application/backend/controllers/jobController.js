/*
 * File Name: jobController.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */



const oracledb = require('oracledb'); //Needed for binding options//cannot be accessed in the scope of this program
//I will leave it for future use however it is explicitly called in jobByID to resolve that access issue
const _ = require('lodash'); //Used for cleaning up request bodies
const { executeQuery } = require('../db'); //Import Oracle DB utilities 
const { executeProcedure } = require('../db');

//Define the name of your job table
const JOB_TABLE = 'HR_jobs';



//Middleware to pre-load job based on the 'jobId' parameter in the route.

const jobByID = async (req, res, next, id) => {
    try {
        //SQL to select the job by JOB_ID.
        const sql = `
            SELECT JOB_ID, JOB_TITLE, MIN_SALARY, MAX_SALARY
            FROM ${JOB_TABLE} 
            WHERE JOB_ID = :id
        `;
        //const result = await executeQuery(sql, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const result = await executeQuery(sql, [id], { outFormat: require('oracledb').OUT_FORMAT_OBJECT });

        const job = result.rows[0];

        if (!job) {
            return res.status(404).json({
                error: "Job not found"
            });
        }

        //Attach the found job object to the request.
        req.job = job;
        next();
    } catch (err) {
        console.error('Oracle jobByID Error:', err);
        return res.status(400).json({
            error: "Could not retrieve job: " + err.message
        });
    }
};

//Single Job CRUD Operations 

//GET: Read the profile data of the job loaded by jobByID
const read = (req, res) => {
    // req.job already contains the job data
    return res.json(req.job);
};

//PUT: Update job data
const update = async (req, res, next) => {
    //Collect updates from the request body. Only update fields defined in schema.
    const allowedUpdates = {
        job_id: req.params.jobId,
        job_title: req.body.job_title,
        min_salary: req.body.min_salary,
        max_salary: req.body.max_salary
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
        bindParams.id = req.params.jobId;
        console.log('Bind Parameters for Update:', req.params.jobId);

        const updateSql = `
            UPDATE ${JOB_TABLE} 
            SET ${updateSqlParts.join(', ')} 
            WHERE JOB_ID = :id
        `;

        await executeQuery(updateSql, bindParams, { autoCommit: true });

        //Retrieve the updated job data to send back
        const readSql = `
            SELECT JOB_ID, JOB_TITLE, MIN_SALARY, MAX_SALARY
            FROM ${JOB_TABLE} 
            WHERE JOB_ID = :id
        `;
        const result = await executeQuery(readSql, [req.params.jobId], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Oracle Update Error:', err);
        return res.status(400).json({
            error: "Could not update job: " + err.message
        });
    }
};

// DELETE: Remove the job
const remove = async (req, res, next) => {
    try {
        const jobId = req.job.JOB_ID;

        const deleteSql = `DELETE FROM ${JOB_TABLE} WHERE JOB_ID = :id`;
        const result = await executeQuery(deleteSql, [jobId], { autoCommit: true });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Job not found for deletion." });
        }

        // Return a confirmation message
        res.json({ message: `Job ${jobId} successfully deleted.` });

    } catch (err) {
        console.error('Oracle Delete Error:', err);
        return res.status(400).json({
            error: "Could not delete job: " + err.message
        });
    }
};


//General Operations

// POST: Create a new job
const create = async (req, res) => {
    try {
        //Construct the INSERT statement
        const sql = `
            INSERT INTO ${JOB_TABLE} (
                JOB_ID, JOB_TITLE, MIN_SALARY, MAX_SALARY
            ) VALUES (
                :job_id, :job_title, :min_salary, :max_salary
            )
        `;

        //Bind parameters from request body
        const binds = {
            job_id: req.body.job_id, //Assuming ID is passed or use a sequence in SQL
            job_title: req.body.job_title,
            min_salary: req.body.min_salary,
            max_salary: req.body.max_salary
        };

        await executeQuery(sql, binds, { autoCommit: true });

        res.status(201).json({ message: "Job created successfully." });

    } catch (err) {
        console.error('Oracle Create Error:', err);
        return res.status(400).json({
            error: "Could not create job: " + err.message
        });
    }
};

//POST: create a new job with stored procedure 
const createWithProcedure = async (req, res) => {
    try {
        const procName = 'SP_NEW_JOB';  
        const bindParams = {
            p_jobid: req.body.jobId, 
            p_title: req.body.jobTitle,
            p_minsal: req.body.minSalary
        };
        await executeProcedure(procName, bindParams, { autoCommit: true });

        res.status(201).json({ message: "Job created successfully via procedure SP_NEW_JOB." });
    } catch (err) {
        console.error('Oracle CreateWithProcedure Error:', err);
        return res.status(400).json({
            error: "Could not create job via procedure: " + err.message
        });
    }
};

//GET: List all jobs
const list = async (req, res) => {
    try {
        const sql = `
            SELECT JOB_ID, JOB_TITLE, MIN_SALARY, MAX_SALARY
            FROM ${JOB_TABLE} 
            ORDER BY JOB_ID
        `;
        //Fetch all jobs
        const result = await executeQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Oracle List Error:', err);
        res.status(500).json({ message: err.message });
    }
};

//DELETE: Delete all jobs
const removeAll = async (req, res) => {
    try {
        const sql = `DELETE FROM ${JOB_TABLE}`;
        const result = await executeQuery(sql, [], { autoCommit: true });

        res.status(200).json({ message: `Successfully deleted ${result.rowsAffected} job(s).` });
    } catch (err) {
        console.error('Oracle RemoveAll Error:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    jobByID,
    read,
    update,
    remove,
    create,
    createWithProcedure,
    list,
    removeAll
};