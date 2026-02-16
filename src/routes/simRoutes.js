import express from 'express';
import { createSim, getSims, deleteSim, assignSim, unassignSim } from '../controller/simController.js';

const router = express.Router();

// POST /sim - add new number
router.post('/', createSim);

// GET /sim - list numbers
router.get('/', getSims);

// DELETE /sim/:id - delete
router.delete('/:id', deleteSim);

// POST /sim/:id/assign - assign to admin/employee
router.post('/:id/assign', assignSim);

// POST /sim/:id/unassign - unassign from admin/employee
router.post('/:id/unassign', unassignSim);

export default router;
