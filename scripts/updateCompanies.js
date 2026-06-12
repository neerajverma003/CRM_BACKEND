import mongoose from "mongoose";
import CompanyModel from "../src/models/companyModel.js";

const MONGO_URI = "mongodb+srv://admiregroup:admire0912@cluster0.hvojqvz.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0";

const updateCompanies = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const updates = [
            {
                nameMatch: /trip2honeymoon/i,
                website: "https://www.trip2honeymoon.com/",
                address: "Metro Pillar No. 772, First Floor, Plot No. 34, Dwarka Mor, New Delhi, Delhi 110059"
            },
            {
                nameMatch: /travel n world|travelnworld/i,
                website: "https://www.travelnworld.com/",
                address: "Metro Pillar No. 772, First Floor, Plot No. 34, Dwarka Mor, New Delhi, Delhi 110059"
            },
            {
                nameMatch: /admire holidays/i,
                website: "https://admireholidays.com/",
                address: "Metro Pillar No. 772, First Floor, Plot No. 34, Dwarka Mor, New Delhi, Delhi 110059"
            },
            {
                nameMatch: /admire softech/i,
                website: "https://admiresoftech.com/",
                address: "Metro Pillar No. 772, First Floor, Plot No. 34, Dwarka Mor, New Delhi, Delhi 110059"
            }
        ];

        for (const update of updates) {
            const result = await CompanyModel.updateMany(
                { companyName: update.nameMatch },
                { $set: { website: update.website, address: update.address } }
            );
            console.log(`Updated ${result.modifiedCount} documents for ${update.nameMatch}`);
        }

        console.log("Update complete.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

updateCompanies();
