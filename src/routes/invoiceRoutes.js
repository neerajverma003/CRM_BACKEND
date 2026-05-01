import express from 'express'
import { createInvoice, getAllInvoices, getInvoiceById, getInvoicesByCustomer, updateInvoice, deleteInvoice, fixInvoiceSnapshots, getLastInvoiceNumber } from '../controller/invoiceController.js'

const router = express.Router()

// Get last invoice number
router.get('/last-number', getLastInvoiceNumber)

// Create invoice
router.post('/create', createInvoice)

// Get all invoices
router.get('/all', getAllInvoices)
// Get invoices by customer
router.get('/customer/:customerId', getInvoicesByCustomer)
// Get invoice by ID
router.get('/:invoiceId', getInvoiceById)

// Fix snapshots for existing invoices
router.post('/fix-snapshots', fixInvoiceSnapshots)

// Update invoice
router.put('/:invoiceId', updateInvoice)

// Delete invoice
router.delete('/:invoiceId', deleteInvoice)

export default router
