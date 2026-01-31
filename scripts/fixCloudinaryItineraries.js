import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/connection.js';
import cloudinary from '../config/cloudinary.js';
import EmployeeLead from '../src/models/employeeLeadModel.js';

// This script finds all EmployeeLead documents with an `itinerary` URL,
// downloads the file, re-uploads it to Cloudinary as `resource_type: 'raw'`
// with `access_mode: 'public'`, and updates the lead.itinerary to the new URL.

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function processLead(lead) {
  const url = lead.itinerary;
  if (!url || typeof url !== 'string') return { ok: false, reason: 'no-url' };
  if (!url.includes('res.cloudinary.com')) return { ok: false, reason: 'not-cloudinary' };

  console.log(`Processing lead ${lead._id} - ${lead.name} -> ${url}`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to download ${url} - status ${res.status}`);
      return { ok: false, reason: `download-${res.status}` };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    // Build folder path similar to uploads: use same path under customer_data
    // We'll try to keep the lead name in the folder if available
    const leadName = (lead.name || 'itineraries').replace(/\s+/g, '_');
    const folderPath = `customer_data/${leadName}`;

    console.log('Uploading to Cloudinary as raw/public...');
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'raw',
      folder: folderPath,
      use_filename: true,
      unique_filename: true,
      access_mode: 'public',
    });

    if (!result || !result.secure_url) {
      console.warn('Cloudinary upload returned no secure_url', result);
      return { ok: false, reason: 'no-secure-url' };
    }

    const newUrl = result.secure_url;
    lead.itinerary = newUrl;
    await lead.save();

    console.log(`Lead ${lead._id} updated -> ${newUrl}`);
    return { ok: true, url: newUrl };
  } catch (err) {
    console.error('Error processing lead', lead._id, err.message || err);
    return { ok: false, reason: err.message };
  }
}

async function main() {
  await connectDB();
  console.log('Connected to MongoDB');

  const leads = await EmployeeLead.find({ itinerary: { $exists: true, $ne: '' } }).lean();
  console.log(`Found ${leads.length} leads with itinerary`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const l of leads) {
    const lead = await EmployeeLead.findById(l._id); // get full mongoose doc for saving
    const result = await processLead(lead);
    if (result.ok) success++;
    else if (result.reason === 'not-cloudinary' || result.reason === 'no-url') skipped++;
    else failed++;
    // be gentle with Cloudinary
    await sleep(500);
  }

  console.log(`Done. success=${success}, skipped=${skipped}, failed=${failed}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error', err);
  process.exit(1);
});
