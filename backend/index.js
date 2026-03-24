const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 1994;

app.use(express.json());
// Configure CORS - Allow your frontend

app.use(cors({
  origin: 'http://localhost:5173', // Your React/Vite frontend port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Routes
app.use("/api/menu", require("./routes/menu.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));

app.get("/", (req, res) => {
  res.json({ message: "Restaurant Menu API" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
