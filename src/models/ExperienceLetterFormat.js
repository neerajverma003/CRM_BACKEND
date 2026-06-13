import mongoose from "mongoose";
const experienceLetterFormatSchema = new mongoose.Schema({
    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true
    },
    companyName:{
        type:String,
        required:true
    },
    bodycontent:{
        type:String,
        required:true
    }
},{timestamps:true})
export default mongoose.model("ExperienceLetterFormat",experienceLetterFormatSchema);