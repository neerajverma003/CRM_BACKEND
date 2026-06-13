import mongoose from "mongoose";

const experienceLetterSchema = new mongoose.Schema({
    refNumber:{
        type:String,
        required:true
    },
    issueDate:{
        type:Date,
        required:true
    },
    // Employee Details
    employeeName:{
        type:String,
        required:true
    },
    designation:{
        type:String,
        required:true
    },
    joiningDate:{
        type:Date,
        required:true
    },
    relievingDate:{
        type:Date,
        required:true
    },
    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true
    },
    formateId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ExperienceLetterFormate"
    },
    status:{
        type:String,
        default:"Draft",
        enum:['Draft','Sent','Downloaded']
    }
}, { timestamps: true });

export default mongoose.model("ExperienceLetter", experienceLetterSchema);
