require("dotenv").config();

const express = require("express");
const path = require("path");
const da = require("./data-access");

const app = express();
const port = 4000;

const bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔐 Middleware to check API key
function checkApiKey(req, res, next) {
  const clientKey = req.headers["x-api-key"];
  const serverKey = process.env.API_KEY;

  console.log("clientKey:", clientKey);
  console.log("serverKey:", serverKey);

  if (!clientKey) {
    return res.status(401).send("API Key is missing");
  }

  if (clientKey !== serverKey) {
    return res.status(403).send("API Key is invalid");
  }

  next();
}

app.get("/customers", checkApiKey, async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.send(cust);
  } else {
    res.status(500).send({ error: err });
  }
});

app.get("/reset", async (req, res) => {
  const [msg, err] = await da.resetCustomers();
  if (msg) {
    res.send(msg);
  } else {
    res.status(500).send({ error: err });
  }
});

app.post("/customers", async (req, res) => {
  const newCustomer = req.body;

  if (!newCustomer) {
    res.status(400).send("Missing request body");
    return;
  }

  const [status, id, err] = await da.addCustomer(newCustomer);

  if (status === "success") {
    newCustomer._id = id;
    res.status(201).send(newCustomer);
  } else {
    res.status(400).send({ error: err });
  }
});

app.get("/customers/find", async (req, res) => {
  const keys = Object.keys(req.query);

  // Require exactly one query string field
  if (keys.length === 0) {
    return res.status(400).send("query string is required");
  }
  if (keys.length > 1) {
    return res.status(400).send("only one query field is allowed");
  }

  const field = keys[0];
  const value = req.query[field];

  const [results, err] = await da.findCustomers(field, value);

  if (results) {
    res.send(results);
  } else {
    res.status(400).send({ error: err });
  }
});

app.get("/customers/:id", async (req, res) => {
  const id = req.params.id;
  const [cust, err] = await da.getCustomerById(id);

  if (cust) {
    res.send(cust);
  } else {
    res.status(404).send({ error: err });
  }
});

app.put("/customers/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updatedCustomer = req.body;

  if (!updatedCustomer) {
    res.status(400).send("Missing request body");
    return;
  }

  // Remove _id if present to avoid MongoDB write errors
  delete updatedCustomer._id;
  updatedCustomer.id = id;

  const [msg, err] = await da.updateCustomer(updatedCustomer);

  if (msg) {
    res.send(msg);
  } else {
    res.status(400).send({ error: err });
  }
});

app.delete("/customers/:id", async (req, res) => {
  const id = req.params.id;
  const [msg, err] = await da.deleteCustomerById(id);

  if (msg) {
    res.send(msg);
  } else {
    res.status(404).send({ error: err });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
