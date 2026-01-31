import { loginUser, changePassword } from "../controller/authController.js";
import express from "express";
const router = express.Router();    
router.post("/login", loginUser);
router.post("/change-password", changePassword);

export default router;  