'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const utils = require('./utils.js');

// switch out mongoose promise provider
mongoose.Promise = global.Promise;

/**
 * Posts chat to DB
 *
 * HTTP POST /chat
 * @param {string} username - Ther username of the chat owner {required: true}
 * @param {string} text - The text body of the chat {required: true}
 * @param {number} timeout - Optional param that indicates the number of seconds to expire chat {required: false, default: 60}
 */

module.exports.postChat = (event, context, callback) => {
    let body;
    try {
        body = JSON.parse(event.body);
        if (!body.username || !body.text) {
            callback(null, utils.createErrorResponse(400, "Request must contain username {string} and text {string}."));
            return;
        }
    } catch (e) {
        callback(null, utils.createErrorResponse(500, "Error parsing HTTP request."));
        return;
    }

    // establish timeout if doesn't exist
    if (!body.timeout) {
        body['timeout'] = 60;
    }

    const db = utils.initializeDatabaseConnection();

    db.once('open', () => {
        utils.createChat(body.username, body.text, body.timeout).then((chat) => {
            callback(null, utils.createValidResponse(Object.assign({}, { id: chat._id })));
            db.close();
            return;
        }).catch((error) => {
            callback(null, utils.createErrorResponse(500, "Error creating chat."));
            db.close();
            return;
        })
    });
}

/**
 * Retrieves chat from DB
 *
 * HTTP GET /chat/{id}
 * @param {string} id - Ther id of the chat {required: true}
 */

module.exports.getOneChat = (event, context, callback) => {
    let params = event.pathParameters;
    if (!params.id || !utils.isValidObjectId(params.id)) {
        callback(null, utils.createErrorResponse(400, "Request must contain 24-character hexademical id {string}."));
        return;
    }

    const db = utils.initializeDatabaseConnection();

    db.once('open', () => {
        utils.retrieveChats({ _id: new ObjectId(params.id) }, {}, 1).then((chats) => {
            callback(null, utils.createValidResponse(Object.assign({}, { username: chats[0]["username"], text: chats[0]["text"], expiration_date: chats[0]["expiration_date"] })));
            db.close();
            return;
        }).catch((error) => {
            callback(null, utils.createErrorResponse(501, "Error retrieving chat."));
            db.close();
            return;
        })
    });
}

/**
 * Retrieves all chats by user from DB
 *
 * HTTP GET /chat/{username}
 * @param {string} username - Ther username of the requested chats {required: true}
 */

module.exports.getUserChats = (event, context, callback) => {
    let params = event.pathParameters;

    if (!params.username) {
        callback(null, utils.createErrorResponse(400, "Request must contain username {string}."));
        return;
    }

    const db = utils.initializeDatabaseConnection();

    db.once('open', () => {
        utils.retrieveChats({ username: params.username }, {}).then((chats) => {
            utils.updateChats({ username: params.username }, { expiration_date: utils.getFormattedDate(0) }).then((updatedChats) => {
                callback(null, utils.createValidResponse(chats.map(chat => { return { id: chat['_id'], text: chat['text'] } })));
                db.close();
                return;
            }).catch((error) => {
                console.log(error);
                callback(null, utils.createErrorResponse(501, "Error updating chats."));
                db.close();
                return;
            });
        }).catch((error) => {
            callback(null, utils.createErrorResponse(501, "Error retrieving chats."));
            db.close();
            return;
        })
    });
}