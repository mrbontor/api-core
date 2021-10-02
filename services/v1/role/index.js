const fs = require('fs');
const logging = require(__dirname + '../../../../libs/logging');
const validate = require(__dirname + '../../../../libs/validateSchema');
const db = require(__dirname + '../../../../libs/db/mongoPromise');
const ObjectId = require('mongodb').ObjectId;

const POST = JSON.parse(fs.readFileSync(__dirname + '/schema/post.json'))

const SUCCESS               = 200
const CREATED               = 201
const BAD_REQUEST           = 400
const UNPROCESSABLE_ENTITY  = 422
const SERVER_ERROR          = 500

const ROLE_COLLECTION       = 'role'
const USER_COLLECTION       = 'user'

let results = { message: '' }

module.exports = {
    postRole: async (req, res) => {
        try {
            let payload = await validate(req.body, POST)
            logging.debug(`[CHECK][PAYLOAD] >>>>> ${JSON.stringify(payload)}`)
            if (payload.length > 0) {
                results.message = 'Validation error'
                results.errors = payload
                return res.status(BAD_REQUEST).send(results);
            }

            let doesExist = await db.findOne(ROLE_COLLECTION, { name: payload.name }, { projection: { name:1 } } )
            logging.debug(`[CHECK][ROLE] >>>>> ${JSON.stringify(doesExist)}`)
            if (null !== doesExist) {
                results.message = `${doesExist.email} is already been used`
                return res.status(UNPROCESSABLE_ENTITY).send(results);
            }

            payload.createdBy = db.newID(payload.createdBy)
            let store = await db.insertOne(ROLE_COLLECTION, payload)
            logging.debug(`[POST][ROLE] >>>>> ${JSON.stringify(store)}`)
            if (undefined === store.insertedId) {
                results.message = 'Incorect Request'
                return res.status(BAD_REQUEST).send(result);
            }

            res.sendStatus(CREATED)
        } catch (e) {
            logging.error(`[POST][ROLE] >>>>> ${JSON.stringify(e.stack)}`)
            results.message = 'Something went wrong, please try again'
            res.status(SERVER_ERROR).send(results)
        }
    },

    getRoles: async (req, res) => {
        let query = [
            // { $match: { },
            {
                $lookup:
                {
                    from: USER_COLLECTION,
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project:{
                    _id: 1,
                    name : 1,
                    description : 1,
                    createdBy : "$user.username",
                    modified : 1
                }
            }
        ]
        try {
            let list = await db.findAggregate(ROLE_COLLECTION, query)
            logging.debug(`[GET][ROLES] >>>>> ${JSON.stringify(list)}`)
            if (list.length === 0) {
                results.message = `No data found`
                return res.status(404).send(results);
            }
            results.message= 'Successful'
            results.data = list
            res.send(results)
        } catch (e) {
            logging.error(`[GET][ROLES] >>>>> ${JSON.stringify(e.stack)}`)
            results.message = 'Something went wrong, please try again'
            res.status(SERVER_ERROR).send(results)
        }
    },

    getRole: async (req, res) => {
        let roleID = req.params.roleID || null
        if(roleID === null) {
            results.message = `No data found`
            return res.status(NOT_FOUND).send(result);
        }
        let query = [
            // { $match: { },
            {
                $lookup:
                {
                    from: USER_COLLECTION,
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project:{
                    _id: 1,
                    name : 1,
                    description : 1,
                    createdBy : "$user.username",
                    modified : 1
                }
            }
        ]
        try {
            let find = await db.findOne(ROLE_COLLECTION, {_id: db.newID(roleID)})
            logging.debug(`[GET][ROLE] >>>>> ${JSON.stringify(find)}`)
            if (find.length === 0) {
                results.message = `No data found`
                return res.status(404).send(results);
            }

            results.message= 'Successful'
            results.data = find
            res.send(results)
        } catch (e) {
            logging.error(`[GET][ROLE] >>>>> ${JSON.stringify(e.stack)}`)
            results.message = 'Something went wrong, please try again'
            res.status(SERVER_ERROR).send(results)
        }
    },

    putRole: async (req, res) => {
        try {
            let payload = await validate(req.body, POST)
            logging.debug(`[CHECK][PAYLOAD] >>>>> ${JSON.stringify(payload)}`)
            if (payload.length > 0) {
                results.message = 'Validation error'
                results.errors = payload
                return res.status(BAD_REQUEST).send(results);
            }

            let doesExist = await db.findOne(ROLE_COLLECTION, { name: payload.name }, { projection: { name:1 } } )
            logging.debug(`[CHECK][ROLE] >>>>> ${JSON.stringify(doesExist)}`)
            if (null !== doesExist) {
                results.message = `${doesExist.email} is already been used`
                return res.status(UNPROCESSABLE_ENTITY).send(results);
            }

            payload.createdBy = db.newID(payload.createdBy)
            let store = await db.findAndUpdate(ROLE_COLLECTION, payload)
            logging.debug(`[PUT][ROLE] >>>>> ${JSON.stringify(store)}`)
            if (undefined === store.insertedId) {
                results.message = 'Incorect Request'
                return res.status(BAD_REQUEST).send(result);
            }

            res.sendStatus(CREATED)
        } catch (e) {
            logging.error(`[PUT][ROLE] >>>>> ${JSON.stringify(e.stack)}`)
            results.message = 'Something went wrong, please try again'
            res.status(SERVER_ERROR).send(results)
        }
    },
}
