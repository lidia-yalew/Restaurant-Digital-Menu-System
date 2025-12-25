const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/menu", require("./routes/menu.routes"));
app.use("/api/orders", require("./routes/order.routes"));

app.get("/", (req, res) => {
  res.json({ message: "Restaurant Menu API" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
