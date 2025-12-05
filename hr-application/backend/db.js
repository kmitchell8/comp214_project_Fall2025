/*
 * File Name: db.js
 * Author(s): Kevon Mitchell    
 * Student ID (s): 301508202
 * Date: December 05, 2025 
 */


const oracledb = require('oracledb');
const dotenv = require('dotenv');
//const crypto = require('crypto');
const bcrypt = require('bcrypt');

dotenv.config();
// Standard number of salt rounds for bcrypt. Higher is slower but more secure.
const SALT_ROUNDS = 10;
//Initialize server
//creating ORACLE_DB connection
const dbConfig = {
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD, 
    connectString: process.env.DB_CONNECT_STRING 
};
async function initialize() {
    try {
        // attempts to connect using credentials credentials
        await oracledb.createPool(dbConfig);
        console.log('Oracle Connection Pool created successfully!');
    } catch (error) {
        console.error('Error creating pool:', error);
        //usually throws if it can't find the instant client library
        //exits applicatoin if failure on startup with error code(1)
        process.exit(1); 
    }
}


async function hashPassword(password) {
    if (!password) return '';
    try {
        //key reminder: deliberate, slow, asynchronous operation for security.
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        console.error("Bcrypt hashing error:", error);
        throw new Error("Password hashing failed.");
    }
}


async function comparePassword(password, hash) {
    if (!password || !hash) return false;
    try {
        // key note: deliberate, slow, asynchronous operation for security.
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error("Bcrypt comparison error:", error);
        return false;
    }
}

//executeQuery
async function executeQuery(sql, bindParams = [], options = {}) {
    let connection;
    try {
        // Get an available connection from the pool
        connection = await oracledb.getConnection();
        
        // Execute the SQL statement
        const result = await connection.execute(sql, bindParams, options);
        await connection.commit(); // Commit if there are any changes
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error; // Re-throw the error so the route handler can catch it
    } finally {
        if (connection) {
            // Release the connection back to the pool, whether the query succeeded or failed
            await connection.close(); 
        }
    }
}

//execute stored procedure
async function executeProcedure(procName, bindParams = {}, options = {}) {
    let connection;
    try {
        // Get an available connection from the pool
        connection = await oracledb.getConnection();
        const sql = `BEGIN ${procName}(${Object.keys(bindParams).map(key => `:${key}`).join(', ')}); END;`;
        // Execute the stored procedure
        const result = await connection.execute(sql, bindParams, options);
        await connection.commit(); // Commit if there are any changes
        return result;
    } catch (error) {
        console.error('Database procedure error:', error);
        throw error; // Re-throw the error so the route handler can catch it
    } finally {
        if (connection) {
            // Release the connection back to the pool, whether the procedure succeeded or failed
            await connection.close(); 
        }
    }
}

//Close Server less abruptly
async function closePool() {
    try {
        // Closes all connections in the pool with code(0)
        await oracledb.getPool().close(0); // 
        console.log('Oracle Connection Pool closed safely.');
    } catch (error) {
        console.error('Error closing pool:', error);
    }
}

module.exports = { initialize, comparePassword, hashPassword, executeQuery, executeProcedure, closePool};

