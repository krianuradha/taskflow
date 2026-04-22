import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";// Create a router instance
const router = Router();// Import the health check controller

router.get("/", healthCheck);// Define a route for the health check endpoint
export default router;