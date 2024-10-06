// routes/invoiceRoutes.js
const express = require('express');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { createInvoice, getInvoices, updateInvoice, deleteInvoice, getInvoiceByRef } = require('../controllers/invoiceControllers');
const router = express.Router();

// 1. Create an Invoice (Admin or Standard user can create for themselves)
router.post('/create', verifyToken, createInvoice);

// 2. Get All Invoices (Admin can get all; Standard user can only get their own)
router.post('/all', getInvoices);

// 3. Update an Invoice (Admin can update any; Standard user can only update their own)
router.put('/update/:invoice_ref', verifyToken, updateInvoice);

// 4. Delete an Invoice (Admin can delete any; Standard user can only delete their own)
router.delete('/delete/:invoice_ref', verifyToken, deleteInvoice);

// 5. Get One Invoice (Admin can get all; Standard user can only get their own)
router.get('/:invoice_ref', getInvoiceByRef);

module.exports = router;
