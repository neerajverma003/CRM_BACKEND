import express from "express";
import { 
  createCompany, 
  deleteCompany, 
  getAllCompanies, 
  getCompanyById, 
  getCompanyByName, 
  updateCompany, 
  uploadCompanyLogo 
} from "../controller/companyController.js";

const router = express.Router();

router.route("/").post(createCompany);
router.route("/all").get(getAllCompanies);
router.route("/companybyname").get(getCompanyByName);
router.route("/:id").get(getCompanyById);
router.route("/:id").patch(updateCompany);
router.post("/upload-logo", uploadCompanyLogo);
router.delete("/delete/:id", deleteCompany);

export default router;