'use strict';

const mongoose = require('mongoose');
const Chat = require('./models/Chat.js');
const config = require('./config.js')

// switch out mongoose promise provider
mongoose.Promise = global.Promise;

/**
 * Helper function to return valid HTTP response
 * @param {string} body 
 * @return {object} The consolidated HTTP response object
 */

module.exports.createValidResponse = (body) => ({
    statusCode: 201,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
});

/**
 * Helper function to return invalid HTTP response
 * @param {number} statusCode The HTTP status code outside of 2xx range 
 * @param {string} message The error message
 * @return {object} The consolidated HTTP error response object
 */

module.exports.createErrorResponse = (statusCode, message) => ({
    statusCode: statusCode || 501,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({ message: message || 'Ambiguous error.' })
});

/**
 * Helper function to initialize new connection to DB and error handler
 * @return {object} The mongoDB database connection object
 */

module.exports.initializeDatabaseConnection = () => {
    const db = mongoose.connect(config.mongoURI).connection;
    db.on('error', console.error.bind(console, 'Database connection error:'));
    return db;
}

/**
 * Function to create chat in database
 * @param {string} username - Ther username of the chat owner {required: true}
 * @param {string} text - The text body of the chat {required: true}
 * @param {number} timeout - Optional param that indicates the number of seconds to expire chat {required: false, default: 60}
 * @return {object} the created database object
 */

module.exports.createChat = (username, text, timeout) => {
    return new Promise(function(resolve, reject) {
        let ChatObject = new Chat({ username: username, text: text, timeout: timeout, expiration_date: Date.now() + (1000 * timeout) });
        Chat.insertMany([ChatObject]).then((docs) => {
            resolve(docs[0]);
        }).catch((error) => {
            reject(new Error(error.message));
        });
    });
}

/**
 * Function to update multiple chats in database
 * @param {object} query - Mongo query object - see https://docs.mongodb.com/manual/reference/operator/query/ for more details
 * @param {object} obj - Mongo object to update 
 * @return {object} the updated database object
 */

module.exports.updateChats = (query, obj) => {
    return new Promise(function(resolve, reject) {
        Chat.update(query, {$set: obj}, { new: true, multi: true }, (error, result) => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Function to retrieve multiple chats in database by user
 * @param {object} query - Mongo query object - see https://docs.mongodb.com/manual/reference/operator/query/ for more details
 * @param {object} obj - Mongo object to update 
 * @return {object} the database object consisting of non-zero number of chats
 */

module.exports.retrieveChats = (query, fields = {}, limit = null) => {
    return new Promise(function(resolve, reject) {
        let q = Chat.find(query, fields);

        // establish limit if not null
        if (limit) {
            q = q.limit(limit);
        }
        Chat.find(q).then((docs) => {
            if (!docs) {
                reject(new Error("Error retreiving chats."));
            } else {
                resolve(docs);
            }
        }).catch((error) => {
            reject(new Error(error.message));
        });
    });
}

/**
 * Helper function to validate input ID against MongoDB ObjectId constraint
 * @param {string} string 
 * @return {boolean} true if matches 24 character hexademical constraint else false
 */

module.exports.isValidObjectId = (string) => {
    // regex that matches 24 digit hex constraint
    let re = /[0-9A-Fa-f]{24}/g;
    if (re.test(string)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Helper function to create valid date string 'timeout' seconds from now with following format 'yyyy-MM-dd hh:mm:ss'
 * @param {timeout} string 
 * @return {string} 
 */

module.exports.getFormattedDate = (timeout, timestamp = Date.now()) => {
    let d = new Date(timestamp + timeout * 1000);
    let year = d.getFullYear().toString();
    let month = ((d.getMonth() + 1 < 10) ? '0' + (d.getMonth() + 1).toString() : (d.getMonth() + 1).toString());
    let date = (d.getDate() < 10 ? '0' + d.getDate().toString() : d.getDate().toString());
    let hours = (d.getHours() < 10 ? '0' + d.getHours().toString() : d.getHours().toString());
    let minutes = (d.getMinutes() < 10 ? '0' + d.getMinutes().toString() : d.getMinutes().toString());
    let seconds = (d.getSeconds() < 10 ? '0' + d.getSeconds().toString() : d.getSeconds().toString());
    return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
}