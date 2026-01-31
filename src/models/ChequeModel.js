import mongoose from "mongoose";

const { Schema } = mongoose;

const chequeSchema = new Schema({
  entryDate:{
    type:String,
    required:true
  },
  chequeIssuedDate:{
    type:Date,
    required:true,
  },
  receiverName:{
    type:String,
    required:true,
  },
  // Cheque validity/date is optional now — removed from UI; keep field for legacy data
  chequeValid:{
    type:Date,
    required:false,
  },
  chequeNumber:{
    type:String,
    required:true,
    unique: true,
    index: true,
  },
  chequeAmount:{
    type:String,
    required:true,
  },
  reasonToIssue:{
    type:String,
    required:true,
  }
  ,
  status:{
    type:String,
    enum:["clear","shifted","pending","cancelled"],
    default:"pending"
  }
  ,
  cancelReason: { type: String },
  clearedDate: { type: Date },
  // When a cheque is 'shifted', store the reason (shiftRemark) for the movement
  // kept `shiftRemark` only — `shiftedTo` removed based on frontend design
  shiftRemark: { type: String },
}, { timestamps: true });


const ChequeModel = mongoose.model("Cheque", chequeSchema);

export default ChequeModel;