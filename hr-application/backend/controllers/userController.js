/*
 * File Name: userController.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */

const oracledb = require('oracledb'); // Needed for binding options
const _ = require('lodash'); // Used for cleaning up request bodies
const { executeQuery, hashPassword } = require('../db'); // Import Oracle DB utilities

// Define the name of your user table
const USER_TABLE = 'USERS'; 

//Core Parameter Middleware 

// Middleware to pre-load a user profile based on the 'userId' parameter in the route.
//Replaces Mongoose's .findById().

const userByID = async (req, res, next, id) => {
    try {
        // SQL to select the user by USER_ID. We explicitly exclude the PASSWORD hash.
        const sql = `
            SELECT USER_ID, USERNAME, EMAIL, ROLE, CREATED_AT, UPDATED_AT 
            FROM ${USER_TABLE} 
            WHERE USER_ID = :id
        `;
        const result = await executeQuery(sql, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        
        // Attach the found user object to the request. (No need to strip password as we excluded it in the SQL)
        req.profile = user;
        next();
    } catch (err) {
        console.error('Oracle userByID Error:', err);
        return res.status(400).json({
            error: "Could not retrieve user: " + err.message
        });
    }
};

//Single User Secure CRUD Operations 

// GET: Read the non-sensitive profile data of the user loaded by userByID
const read = (req, res) => {
    // req.profile already contains the non-sensitive user data
    return res.json(req.profile);
};

// PUT: Update user data
const update = async (req, res, next) => {
    // Collect updates from the request body. Only update fields we allow.
    const allowedUpdates = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password, // Optional update
    };

    // Filter out undefined/null values
    const updates = _.pickBy(allowedUpdates, _.identity); 

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields provided for update." });
    }

    try {
        let updateSqlParts = [];
        let bindParams = {};
        let bindCount = 1;

        // 1. Process password update if present
        if (updates.password) {
            const hashedPassword = await hashPassword(updates.password);
            updateSqlParts.push(`PASSWORD = :p_hash`);
            bindParams.p_hash = hashedPassword;
            delete updates.password; // Remove from updates map so we don't treat it as a normal field
        }

        // 2. Process other field updates
        for (const [key, value] of Object.entries(updates)) {
            const paramName = `p${bindCount++}`;
            updateSqlParts.push(`${key.toUpperCase()} = :${paramName}`);
            bindParams[paramName] = value;
        }

        // 3. Add the UPDATED_AT timestamp and the WHERE clause
        updateSqlParts.push(`UPDATED_AT = CURRENT_TIMESTAMP`);
        bindParams.id = req.profile.USER_ID;

        const updateSql = `
            UPDATE ${USER_TABLE} 
            SET ${updateSqlParts.join(', ')} 
            WHERE USER_ID = :id
        `;
        
        await executeQuery(updateSql, bindParams, { autoCommit: true });

        // 4. Retrieve the updated user data to send back
        // We reuse the userByID logic's SQL to ensure the response is correct
        const readSql = `
            SELECT USER_ID, USERNAME, EMAIL, ROLE, CREATED_AT, UPDATED_AT 
            FROM ${USER_TABLE} 
            WHERE USER_ID = :id
        `;
        const result = await executeQuery(readSql, [req.profile.USER_ID], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        res.json(result.rows[0]);

    } catch (err) {
        console.error('Oracle Update Error:', err);
        return res.status(400).json({
            error: "Could not update user: " + err.message
        });
    }
};

// DELETE: Remove the user
const remove = async (req, res, next) => {
    try {
        const userId = req.profile.USER_ID; 
        
        const deleteSql = `DELETE FROM ${USER_TABLE} WHERE USER_ID = :id`;
        const result = await executeQuery(deleteSql, [userId], { autoCommit: true }); 

        if (result.rowsAffected === 0) {
             return res.status(404).json({ error: "User not found for deletion." });
        }
        
        // Return a confirmation message
        res.json({ message: `User ${userId} successfully deleted.`});

    } catch (err) {
        console.error('Oracle Delete Error:', err);
        return res.status(400).json({
            error: "Could not delete user: " + err.message
        });
    }
};


// --- General Operations ---

// POST: Create a new user (Placeholder: Registration is handled in authController.js)
const create = async (req, res) => {
    // Note: The main registration logic is usually handled by authController.register
    // This is kept for Mongoose compatibility but should redirect to the auth route.
    return res.status(405).json({ error: "Use the /api/register endpoint for user creation." });
};

// GET: List all users
const list = async (req, res) => {
    try {
        // Select safe fields only (excluding the PASSWORD hash)
        const sql = `
            SELECT USER_ID, USERNAME, EMAIL, ROLE, CREATED_AT, UPDATED_AT 
            FROM ${USER_TABLE} 
            ORDER BY USER_ID
        `;
        // Fetch all users
        const result = await executeQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Oracle List Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// DELETE: Delete all users
const removeAll = async (req, res) => {
    try {
        // NOTE: This should be restricted to 'admin' roles and avoided in production.
        const sql = `DELETE FROM ${USER_TABLE}`;
        const result = await executeQuery(sql, [], { autoCommit: true }); 
        
        res.status(200).json({ message: `Successfully deleted ${result.rowsAffected} user(s).` });
    } catch (err) {
        console.error('Oracle RemoveAll Error:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    userByID, // The crucial parameter middleware
    read,
    update,
    remove,
    create, // Will be primarily handled by authController.register
    list,
    removeAll
};