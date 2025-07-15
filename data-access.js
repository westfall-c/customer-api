// data-access.js
const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "custdb";
let collection;

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection("customers");
}

async function getCustomers() {
  try {
    if (!collection) await connect();
    const customers = await collection.find().toArray();

//throw new Error("Simulated server crash");

    return [customers, null];
  } catch (err) {
    console.error("Error fetching customers:", err.message);
    return [null, err.message];
  }
}

module.exports = { getCustomers };
