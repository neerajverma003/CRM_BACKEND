import OfferLetterFormat from "../models/OfferLetterFormatModel.js";
import puppeteer from "puppeteer";

export const createOfferLetterFormat = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body._id;
    delete body.__v;
    delete body.createdAt;
    delete body.updatedAt;

    if (body.companyId) {
      const updatedObject = await OfferLetterFormat.findOneAndUpdate(
        { companyId: body.companyId },
        { ...body, createdBy: body.createdBy || null },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
      return res.status(200).json({ success: true, data: updatedObject });
    }

    const object = await OfferLetterFormat.create({ ...body, createdBy: body.createdBy || null });
    return res.status(201).json({ success: true, data: object });
  } catch (error) {
    console.error("Error creating/updating offer letter format:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOfferLetterFormats = async (req, res) => {
  try {
    const filter = {};
    if (req.query.companyId) {
      filter.companyId = req.query.companyId;
    }
    const list = await OfferLetterFormat.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching formats:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfferLetterFormatById = async (req, res) => {
  try {
    const { id } = req.params;
    const format = await OfferLetterFormat.findById(id);
    if (!format) return res.status(404).json({ success: false, message: "Format not found" });
    return res.status(200).json({ success: true, data: format });
  } catch (error) {
    console.error("Error fetching format:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOfferLetterFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    delete body._id;
    delete body.__v;
    delete body.createdAt;
    delete body.updatedAt;

    const updated = await OfferLetterFormat.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Format not found" });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating format:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOfferLetterFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await OfferLetterFormat.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Format not found" });
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting format:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePDF = async (req, res) => {
  let browser;
  try {
    const { htmlContent, fileName = "offer_letter.pdf", companyName = "Admire Softech Solutions Pvt Ltd" } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ success: false, message: "HTML content is required" });
    }

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlContent, { waitUntil: "networkidle2" });

    // Generate PDF with header and footer
    const pdfBuffer = await page.pdf({
      format: "A4",
      displayHeaderFooter: false, // We use the HTML-based header/footer for consistent preview
      margin: {
        top: "100px",
        bottom: "80px",
        left: "20px",
        right: "20px",
      },
      printBackground: true,
    });

    // Send PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};