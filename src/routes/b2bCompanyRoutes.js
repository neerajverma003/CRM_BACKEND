import express from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompaniesByname
} from "../controller/b2bCompanyController.js";
import { getCompaniesByEmployee } from "../controller/b2bCompanyController.js";

const router = express.Router();

router.post("/", createCompany); 
router.get("/", getCompanies);
router.get("/employee/:employeeId", getCompaniesByEmployee);
router.get("/:company", getCompaniesByname);
router.get("/:id", getCompanyById);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
