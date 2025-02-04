require("dotenv").config();
const express = require("express");
const https = require("https"); // Import the 'https' module
const fs = require("fs"); // Import the 'fs' module for file operations
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const grantRoutes = require("./routes/grantRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const addRoutes = require("./routes/subjectRoutes");
const postRoutes = require("./routes/postRoutes");
// server.js
const cookieParser = require("cookie-parser"); // Import cookie-parser

const getUserType = require("./middleware/checkUserType");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser()); 
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.json({ message: "SERVER IS RUNNING. Try /api/v1/test" });
});

app.get("/api/v1/test", (req, res) => {
  res.json({ message: "CREDBUD SERVER IS RUNNING" });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/grant", grantRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/subjects", addRoutes);
app.use("/api/v1/posts", postRoutes);

// Specify the paths to your SSL certificate and private key files
const privateKeyPath = "key.pem";
const certificatePath = "cert.pem";

// Read the SSL certificate and private key files
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const certificate = fs.readFileSync(certificatePath, "utf8");

const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV != "production") {
  const httpsServer = https.createServer(credentials, app);
  const PORT = process.env.PORT || 443; // Use your desired HTTPS port
  httpsServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in development mode.`);
  });
} else {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}

// Start the server on the specified port
