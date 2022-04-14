const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "restaurantdb";
const collectionName = "menuitems";

exports.getAllItems = getAllItems;
exports.getItemByID = getItemByID;
exports.itemExists = itemExists;
exports.deleteItem = deleteItem;
exports.addItem = addItem;
exports.updateItem = updateItem;

/**
 * Gets all the items.
 *
 * @throws {MongoError} if a database error occurs
 * @returns {Promise<array>} resolves to: an array of MenuItem objects (empty if there are none)
 */
async function getAllItems() {
    let docs;
    try {
        let conn = await client.connect();
        let collection = conn.db(dbName).collection(collectionName);
        docs = await collection.find({}).sort({ id: 1 }).toArray();
    } catch (err) {
        docs = [];
        throw err;
    } finally {
        await client.close(); //important - code will hang indefinitely if you forget this
        return docs;
    }
}

/**
 * Determines if a MenuItem object exists in the database.
 *
 * @param {object} - the object to find
 * @throws {MongoError} if a database error occurs
 * @returns {Promise<boolean>} resolves to: true if the item exists; false otherwise
 */
async function itemExists(item) {
    let res;
    try {
        let conn = await client.connect();
        let collection = conn.db(dbName).collection(collectionName);
        let docs = await collection.find({ id: item.id }).toArray();
        res = docs.length === 1;
    } catch (err) {
        res = false;
        throw err;
    } finally {
        await client.close();
        return res;
    }
}

/**
 * Gets the object with the specified ID.
 *
 * @param {number} itemID - the ID of the object to return
 * @throws {MongoError} if a database error occurs
 * @returns {Promise<object>} resolves to: the matching object; or null if the object doesn't exist
 */
async function getItemByID(itemID) {
    let res;
    try {
        let conn = await client.connect();
        let collection = conn.db(dbName).collection(collectionName);
        let docs = await collection.find({ id: itemID }).toArray();
        res = docs.length === 1 ? docs[0] : null;
    } catch (err) {
        res = null;
        throw err;
    } finally {
        await client.close();
        return res;
    }
}

/**
 * Deletes the specified item (if it exists).
 *
 * @param {object} item - the item to delete
 * @throws {MongoError} if a database error occurs
 * @returns {Promise<boolean>} resolves to: true if the item was deleted; false if the item doesn't exist.
 */
async function deleteItem(item) {
    let res;

    try {
        let conn = await client.connect();
        let collection = conn.db(dbName).collection(collectionName);
        let query = { id: item.id };
        let result = await collection.deleteOne(query);
        res = result.deletedCount === 1;
    } catch (err) {
        res = false;
        throw err;
    } finally {
        await client.close();
        return res;
    }
}

/**
 * Adds the specified item (if it doesn't already exist).
 *
 * @param {object} item - the item to add
 * @throws {MongoError} if a database error occurs
 * @returns {Promise<boolean>} resolves to: true if the item was added; false if the item already exists.
 */
async function addItem(item) {
    let res;
    try {
        let conn = await client.connect();
        let collection = conn.db(dbName).collection(collectionName);
        let docs = await collection.find({ id:item.id }).toArray();

        if (docs.length !== 0) {
            res = false;
        } else {
            let result = await collection.insertOne(item);
            res = result.acknowledged;
        }
    } catch (err) {
        res = false;
        throw err;
    } finally {
        await client.close();
        return res;
    }
}

/**
 * Updates the specified item (if it exists).
 *
 * @param {object} item - the item to update
 * @throws {MongoError} if a database error occurs
 * @returns {Promise<boolean>} resolves to: true if the item was updated; false if the item doesn't exist.
 */
async function updateItem(item) {
    let res;
    try {
        let conn = await client.connect();
        let collection = conn.db(dbName).collection(collectionName);
        let query = {
            id: item.id,
        };
        let values = {
            $set: {
                category: item.category,
                description: item.description,
                price: item.price,
                vegetarian: item.vegetarian,
            },
        };
        let docs = await collection.find(query).toArray();
        if (docs.length === 0) {
            res = false;
        } else {
            let result = await collection.updateOne(query, values);
            res = result.matchedCount === 1;
           // console.log(result)
        }
    } catch (err) {
        res = false;
        throw err;
    } finally {
        await client.close();
        return res;
    }
}
