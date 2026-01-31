import express from "express";
import { createCheque, getAllCheque, updateCheque } from "../controller/chequeController.js";

const router = express.Router();

router.route("/").post(createCheque);
router.route("/get").get(getAllCheque)
router.route("/:id").put(updateCheque);


 
export default router;


