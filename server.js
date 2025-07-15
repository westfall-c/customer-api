const express = require("express");
const path = require("path");
const da = require("./data-access");

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/customers", async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.send(cust);
  } else {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
