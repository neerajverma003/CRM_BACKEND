import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tutorial from '../src/models/tutorialsModel.js';
import Company from '../src/models/CompanyModel.js';
import Candidate from '../src/models/candidateModel.js';
import EmployeeData from '../src/models/employeeDataModel.js';
import CustomerData from '../src/models/customerData.js';
import CustomerCreation from '../src/models/customerCreation.js';
import OperationLead from '../src/models/operationLeadModel.js';
import Expense from '../src/models/ExpenseModel.js';
import Itinerary from '../src/models/ItineraryModel.js';
import Hotel from '../src/models/hotelModel.js';

dotenv.config();

const CDN_BASE = 'https://media.admiresoftech.online';

/**
 * Helper to rewrite Cloudinary or S3 URLs to use the custom CDN domain.
 * This assumes the S3 bucket is the origin for the CDN.
 */
const formatUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith(CDN_BASE)) return url;

  // If it's a Cloudinary URL, we extract the public ID part if possible, 
  // but usually migration to S3 changes the path entirely.
  // If it's an S3 URL (e.g., s3.ap-south-1.amazonaws.com/CRM/...), we replace it.
  
  const s3Pattern = /https:\/\/.*\.amazonaws\.com\/[^\/]+\/(.*)/;
  const match = url.match(s3Pattern);
  if (match && match[1]) {
    return `${CDN_BASE}/${match[1]}`;
  }

  // Fallback: If it doesn't match S3 but is an external link, we keep it as is
  // unless the user specifically wants to rewrite Cloudinary links too.
  return url;
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Tutorials
    const tutorials = await Tutorial.find({});
    for (const tut of tutorials) {
      let changed = false;
      if (tut.fileUrl && !tut.fileUrl.startsWith(CDN_BASE)) {
        tut.fileUrl = formatUrl(tut.fileUrl);
        changed = true;
      }
      if (changed) await tut.save();
    }
    console.log('Tutorials migrated');

    // 2. Hotels
    const hotels = await Hotel.find({});
    for (const hotel of hotels) {
      if (hotel.hotelImages && Array.isArray(hotel.hotelImages)) {
        hotel.hotelImages = hotel.hotelImages.map(formatUrl);
        await hotel.save();
      }
    }
    console.log('Hotels migrated');

    // 3. Candidates
    const candidates = await Candidate.find({});
    for (const cand of candidates) {
      if (cand.resume && !cand.resume.startsWith(CDN_BASE)) {
        cand.resume = formatUrl(cand.resume);
        await cand.save();
      }
    }
    console.log('Candidates migrated');

    // 4. Employee Data
    const empDatas = await EmployeeData.find({});
    for (const ed of empDatas) {
      if (ed.documents) {
        let changed = false;
        for (const key in ed.documents) {
          if (ed.documents[key].url && !ed.documents[key].url.startsWith(CDN_BASE)) {
            ed.documents[key].url = formatUrl(ed.documents[key].url);
            changed = true;
          }
        }
        if (changed) {
          ed.markModified('documents');
          await ed.save();
        }
      }
    }
    console.log('Employee Data migrated');

    // 5. Operation Leads / Customer Data
    const opLeads = await OperationLead.find({});
    for (const ol of opLeads) {
      if (ol.documents && Array.isArray(ol.documents)) {
        ol.documents = ol.documents.map(doc => ({
          ...doc,
          fileUrl: formatUrl(doc.fileUrl)
        }));
        ol.markModified('documents');
        await ol.save();
      }
    }
    console.log('Operation Leads migrated');

    // 6. Itineraries
    const itineraries = await Itinerary.find({});
    for (const itin of itineraries) {
      if (itin.Upload && Array.isArray(itin.Upload)) {
        itin.Upload = itin.Upload.map(formatUrl);
        await itin.save();
      }
    }
    console.log('Itineraries migrated');

    // 7. Companies
    const companies = await Company.find({});
    for (const comp of companies) {
      if (comp.logo && !comp.logo.startsWith(CDN_BASE)) {
        comp.logo = formatUrl(comp.logo);
        await comp.save();
      }
    }
    console.log('Companies migrated');

    // 8. Expenses
    const expenses = await Expense.find({});
    for (const exp of expenses) {
      if (exp.billUrl && !exp.billUrl.startsWith(CDN_BASE)) {
        exp.billUrl = formatUrl(exp.billUrl);
        await exp.save();
      }
    }
    console.log('Expenses migrated');

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
