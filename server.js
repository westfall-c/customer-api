const express = require("express");
const path = require("path");
const da = require("./data-access");

const app = express();
const port = 4000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/customers", async (req, res) => {
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
