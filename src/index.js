const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
require("./models/init");
require("dotenv").config({ path: "./environments/.env" });

const app = express();
const path = require("path");

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite default
      "http://127.0.0.1:5173",
      "http://localhost:3000", // React default
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const passwordResetRoutes = require("./routes/passwordReset");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const supplierRoutes = require("./routes/suppliers");
const orderRequestRoutes = require("./routes/orderRequests");
const reportsRoutes = require("./routes/reports");
const permissionRoutes = require("./routes/permissions");
const userRoutes = require("./routes/users");
const uploadRoutes = require("./routes/upload");
const approveRequestsRoutes = require("./routes/approveRequests");
const confirmDeliveriesRoutes = require("./routes/confirmDeliveries");
const salesRoutes = require("./routes/sales");
const stockRoutes = require("./routes/stocks");
const notificationsRoutes = require("./routes/notifications");
const expenseRoutes = require("./routes/expenses");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/order-requests", orderRequestRoutes);
app.use("/api/approve-requests", approveRequestsRoutes);
app.use("/api/confirm-deliveries", confirmDeliveriesRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/expenses", expenseRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "IMS-G6 Backend is running." });
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Start server after DB connection
const PORT = process.env.PORT || 5001;
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });
