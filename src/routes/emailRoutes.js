import express from 'express';
import { createEmail, getEmails, deleteEmail, assignEmail, unassignEmail } from '../controller/emailController.js';

const router = express.Router();

// POST /email - add new email
router.post('/', createEmail);

// GET /email - list emails
router.get('/', getEmails);

// DELETE /email/:id - delete
router.delete('/:id', deleteEmail);

// POST /email/:id/assign - assign to admin/employee
router.post('/:id/assign', assignEmail);

// POST /email/:id/unassign - unassign from admin/employee
router.post('/:id/unassign', unassignEmail);

export default router;
