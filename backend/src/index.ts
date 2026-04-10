import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./config/database";
import authRoutes from "./routes/authRoutes";
import questionRoutes from "./routes/questionRoutes";
import testRoutes from "./routes/testRoutes";
import serviceRoutes from "./routes/serviceRoutes";
 
// Load environment variables
dotenv.config();

// Validate critical env vars in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.ALLOWED_ORIGINS) {
    console.error("❌ ALLOWED_ORIGINS must be set in production!");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("❌ JWT_SECRET must be at least 32 characters in production!");
    process.exit(1);
  }
}

// Initialize express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security headers (SEC-004)
app.use(helmet());

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000"],
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Health check route
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Career DNA Profiler Backend is running" });
});

// Routes (removed duplicate routes/index.ts mount — BUG-006)
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/test", testRoutes);
app.use("/api/services", serviceRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Connect to Database and Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();

export default app;
