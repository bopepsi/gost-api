const { poolPromise } = require('../config/dbConfig');

const createInvoice = async (req, res) => {
    const { vendor_name, invoice_ref, invoice_date, service_date_start, service_date_end,
        currency, net_total, tax_total, gross_total, file_name, route_name, description, client } = req.body;

    try {
        const pool = await poolPromise;

        const query = `
        INSERT INTO brdrch.dbo.invoices (
            date, vendor_name, invoice_ref, invoice_date, 
            service_date_start, service_date_end, currency, net_total, tax_total, gross_total, 
            file_name, location, route_name, description, client
        )
        VALUES (
            '${new Date().toISOString().slice(0, 10)}', '${vendor_name}', '${invoice_ref}', '${invoice_date}', 
            '${service_date_start}', '${service_date_end}', '${currency}', ${net_total}, 
            ${tax_total}, ${gross_total}, '${file_name}', '-', '${route_name}', '${description}', 
            '${client}'
        );`;

        await pool.request().query(query);

        res.status(201).json({ message: 'Invoice created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getInvoices = async (req, res) => {

    try {
        const pool = await poolPromise;

        // If the user is not an admin, they can only retrieve their own invoices
        let query;
        if (req.body.role == 'admin') {
            query = `SELECT TOP 20 * FROM brdrch.dbo.invoices order by invoice_date DESC`; // Admins get all invoices
        } else {
            query = `SELECT TOP 20 * FROM brdrch.dbo.invoices WHERE vendor_name = '${req.body.name}' order by invoice_date DESC`; // Standard users get only their own invoices
        }

        const result = await pool.request().query(query);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getInvoiceByID = async (req, res) => {
    const { inv_id } = req.params; // Extract invoice_ref from request params

    try {
        const pool = await poolPromise;

        // Query to retrieve the specific invoice by its invoice_ref
        const query = `SELECT * FROM brdrch.dbo.invoices WHERE ID = '${inv_id}'`;

        const result = await pool.request().query(query);

        if (result.recordset.length === 0) {
            // If no invoice is found with the provided invoice_ref
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoice = result.recordset[0]; // Retrieve the invoice record

        // If you want to include a permission check for the user's name (if provided as a query parameter)
        if (req.query.role !== 'admin' && invoice.vendor_name !== req.query.name) {
            return res.status(403).json({ message: 'Permission denied: You can only view your own invoices.' });
        }

        // Return the invoice details if everything is valid
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


const updateInvoice = async (req, res) => {
    const { invoice_ref } = req.params;
    const { company, gl_code, sub_gl_code, br_code, vendor_name, invoice_date, service_date_start, service_date_end, currency, net_total, tax_total, gross_total, file_name, location, route_name, description, client } = req.body;

    try {
        const pool = await poolPromise;

        // First, check if the user has access to this invoice
        const checkQuery = `SELECT * FROM brdrch.dbo.invoices WHERE invoice_ref = '${invoice_ref}';`;
        const invoiceResult = await pool.request().query(checkQuery);

        if (invoiceResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoice = invoiceResult.recordset[0];

        // If the user is not an admin and they do not own the invoice, deny access
        if (req.user.role !== 'admin' && invoice.vendor_name !== req.user.name) {
            return res.status(403).json({ message: 'Permission denied: You can only update your own invoices.' });
        }

        // Update the invoice
        const updateQuery = `
            UPDATE brdrch.dbo.invoices 
            SET company = '', gl_code = '', sub_gl_code = '', br_code = '', vendor_name = '${req.user.name}', invoice_date = '${invoice_date}', service_date_start = '${service_date_start}', service_date_end = '${service_date_end}', currency = '${currency}', net_total = ${net_total}, tax_total = ${tax_total}, gross_total = ${gross_total}, file_name = '${file_name}', location = '', route_name = '${route_name}', description = '${description}', client = '${client}'
            WHERE invoice_ref = '${invoice_ref}';
        `;
        await pool.request().query(updateQuery);

        res.status(200).json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteInvoice = async (req, res) => {
    const { invoice_ref } = req.params;
    try {
        const pool = await poolPromise;

        // First, check if the user has access to this invoice
        const checkQuery = `SELECT * FROM brdrch.dbo.invoices WHERE invoice_ref = '${invoice_ref}'`;
        const invoiceResult = await pool.request().query(checkQuery);

        if (invoiceResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoice = invoiceResult.recordset[0];

        // If the user is not an admin and they do not own the invoice, deny access
        if (req.query.role !== 'admin' && invoice.vendor_name !== req.query.name) {
            return res.status(403).json({ message: 'Permission denied: You can only delete your own invoices.' });
        }

        // Delete the invoice
        const deleteQuery = `DELETE FROM brdrch.dbo.invoices WHERE invoice_ref = '${invoice_ref}'`;

        await pool.request().query(deleteQuery);

        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceByID,
    updateInvoice,
    deleteInvoice
};