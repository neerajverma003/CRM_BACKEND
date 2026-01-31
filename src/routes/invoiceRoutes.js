import express from 'express'
import { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice, fixInvoiceSnapshots } from '../controller/invoiceController.js'

const router = express.Router()

// Create invoice
router.post('/create', createInvoice)

// Get all invoices
router.get('/all', getAllInvoices)

// Get invoice by ID
router.get('/:invoiceId', getInvoiceById)

// Fix snapshots for existing invoices
router.post('/fix-snapshots', fixInvoiceSnapshots)

// Update invoice
router.put('/:invoiceId', updateInvoice)

// Delete invoice
router.delete('/:invoiceId', deleteInvoice)

export default router
