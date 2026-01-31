// import { loginUser } from "../controller/authController.js";
import express from "express";
import { createRole, getAllRole, updateRole, deleteRole } from "../controller/roleController.js";
const router = express.Router();    
router.post("/role", createRole);
router.get("/getrole", getAllRole)
router.put("/updaterole/:id", updateRole);
router.delete("/deleterole/:id", deleteRole);

export default router;  