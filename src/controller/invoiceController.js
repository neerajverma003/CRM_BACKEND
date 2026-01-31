import Invoice from '../models/InvoiceModel.js'
import EmployeeLead from '../models/employeeLeadModel.js'

// Create a new invoice
export const createInvoice = async (req, res) => {
  try {
    const { invoiceNo, customerId, customerName, customerEmail, customerPhone, date, amount, costType, paymentMode, inclusions, termsConditions, paymentPolicy, customerSnapshot: payloadSnapshot } = req.body

    if (!invoiceNo || !customerId || !date || !amount || !costType || !paymentMode) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Prefer snapshot sent from client; otherwise fetch lead to capture snapshot
    let leadSnapshot = null
    if (payloadSnapshot && Object.keys(payloadSnapshot).length) {
      leadSnapshot = payloadSnapshot
    } else {
      let leadDoc = null
      try {
        leadDoc = await EmployeeLead.findById(customerId).lean()
        if (leadDoc) leadSnapshot = leadDoc
      } catch (e) {
        console.warn('Could not fetch EmployeeLead for snapshot', e.message)
      }
    }

    if (!leadSnapshot) {
      console.warn(`No EmployeeLead found for customerId=${customerId} when creating invoice ${invoiceNo}`)
    }

    const invoiceData = {
      invoiceNo,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      amount,
      costType,
      paymentMode,
      inclusions,
      termsConditions,
      paymentPolicy,
      status: 'issued',
      customerSnapshot: leadSnapshot || {},
      departureCity: leadSnapshot?.departureCity,
      destination: leadSnapshot?.destination,
      expectedTravelDate: leadSnapshot?.expectedTravelDate,
      noOfDays: leadSnapshot?.noOfDays,
      noOfPerson: leadSnapshot?.noOfPerson,
      noOfChild: leadSnapshot?.noOfChild,
      childAges: leadSnapshot?.childAges,
      tripType: leadSnapshot?.tripType,
      totalAmount: leadSnapshot?.totalAmount,
      advanceRequired: leadSnapshot?.advanceRequired,
      totalAirfare: leadSnapshot?.totalAirfare,
      advanceAirfare: leadSnapshot?.advanceAirfare,
      // extra lead fields
      discount: leadSnapshot?.discount,
      discountAirfare: leadSnapshot?.discountAirfare,
      tokenAmount: leadSnapshot?.tokenAmount,
      inclusion: leadSnapshot?.inclusion,
      specialInclusions: leadSnapshot?.specialInclusions,
      exclusion: leadSnapshot?.exclusion
    }

    const invoice = new Invoice(invoiceData)

    await invoice.save()

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    })
  } catch (err) {
    console.error(err)
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists' })
    }
    return res.status(500).json({ success: false, message: err.message })
  }
}

// Fix missing customer snapshots for existing invoices
export const fixInvoiceSnapshots = async (req, res) => {
  try {
    const invoices = await Invoice.find({ $or: [{ customerSnapshot: { $exists: false } }, { customerSnapshot: {} }] })
    let updated = 0
    for (const inv of invoices) {
      try {
        const lead = await EmployeeLead.findById(inv.customerId).lean()
        if (lead) {
          inv.customerSnapshot = lead
          inv.departureCity = lead.departureCity
          inv.destination = lead.destination
          inv.expectedTravelDate = lead.expectedTravelDate
          inv.noOfDays = lead.noOfDays
          inv.noOfPerson = lead.noOfPerson
          inv.noOfChild = lead.noOfChild
          inv.childAges = lead.childAges
          inv.tripType = lead.tripType
          inv.totalAmount = lead.totalAmount
          inv.advanceRequired = lead.advanceRequired
          inv.totalAirfare = lead.totalAirfare
          inv.advanceAirfare = lead.advanceAirfare
            inv.discount = lead.discount
            inv.discountAirfare = lead.discountAirfare
            inv.tokenAmount = lead.tokenAmount
            inv.inclusion = lead.inclusion
            inv.specialInclusions = lead.specialInclusions
            inv.exclusion = lead.exclusion
          await inv.save()
          updated++
        }
      } catch (e) {
        console.warn('Failed to update invoice snapshot for', inv._id, e.message)
      }
    }

    return res.status(200).json({ success: true, message: `Updated ${updated} invoices` })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

// Get all invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params

    const invoice = await Invoice.findById(invoiceId).populate('customerId')

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' })
    }

    return res.status(200).json({
      success: true,
      data: invoice
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params
    const updateData = req.body

    const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData, { new: true })

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' })
    }

    return res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params

    const invoice = await Invoice.findByIdAndDelete(invoiceId)

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' })
    }

    return res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: err.message })
  }
}
