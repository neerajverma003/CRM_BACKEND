import mongoose from "mongoose";

const B2bCompanySchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },
    company: {type:String, required: true}, // Reference to main Company collection
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "b2bState",
      required: true,
    },
    companyName: { 
      type: String,
      required: true,
    },
    contactPersonName: {
      type: String,
      required: true,
    },
    contactPersonNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    }
    ,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: false,
    }
  },
  { timestamps: true }
);

export default mongoose.model("B2bCompany", B2bCompanySchema);