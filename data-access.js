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

async function resetCustomers() {
  try {
    if (!collection) await connect();

    const defaultCustomers = [
      { id: 0, name: "Mary Jackson", email: "maryj@abc.com", password: "maryj" },
      { id: 1, name: "Karen Addams", email: "karena@abc.com", password: "karena" },
      { id: 2, name: "Scott Ramsey", email: "scottr@abc.com", password: "scottr" }
    ];

    await collection.deleteMany({});
    await collection.insertMany(defaultCustomers);
    const count = await collection.countDocuments();

    return [`${count} records inserted`, null];
  } catch (err) {
    console.error("Error in resetCustomers:", err.message);
    return [null, err.message];
  }
}

async function addCustomer(newCustomer) {
  try {
    if (!collection) await connect();
    const result = await collection.insertOne(newCustomer);
    return ["success", result.insertedId, null];
  } catch (err) {
    console.error("Error adding customer:", err.message);
    return ["fail", null, err.message];
  }
}

async function getCustomerById(id) {
  try {
    if (!collection) await connect();

    const customer = await collection.findOne({ id: +id }); // +id ensures numeric match

    if (customer) {
      return [customer, null];
    } else {
      return [null, "invalid customer number"];
    }
  } catch (err) {
    console.error("Error in getCustomerById:", err.message);
    return [null, err.message];
  }
}

async function updateCustomer(updatedCustomer) {
  try {
    if (!collection) await connect();

    const filter = { id: updatedCustomer.id };
    const update = { $set: updatedCustomer };

    const result = await collection.updateOne(filter, update);

    if (result.modifiedCount === 1) {
      return ["one record updated", null];
    } else {
      return [null, "no record updated"];
    }
  } catch (err) {
    console.error("Error updating customer:", err.message);
    return [null, err.message];
  }
}

async function deleteCustomerById(id) {
  try {
    if (!collection) await connect();

    const result = await collection.deleteOne({ id: +id });

    if (result.deletedCount === 1) {
      return ["one record deleted", null];
    } else {
      return [null, "no record deleted"];
    }
  } catch (err) {
    console.error("Error deleting customer:", err.message);
    return [null, err.message];
  }
}

module.exports = {
  getCustomers,
  resetCustomers,
  addCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomerById
};
