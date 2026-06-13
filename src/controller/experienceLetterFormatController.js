import ExperienceLetterFormat from "../models/ExperienceLetterFormat.js";

// save or update format for a comapny
export const saveFormat = async (req,res)=>{
    try{
        const {companyId,companyName,bodycontent} = req.body;
        // check if format exist for this company
        let format = await ExperienceLetterFormat.findOne({companyId:companyId});
        if(format){
            // update existing
            format.bodycontent=bodycontent;
            await format.save();

        }else{
            // create new formate
            format=new ExperienceLetterFormat({
                companyId,
                companyName,
                bodycontent
            });
            await format.save();
        }
        res.status(200).json({
            success:true,
            data:format,
            message:"Format Saved Successfully"
        })

    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })

    }
}

// Get Format by CompanyId
export const getFormatByCompany = async(req,res)=>{
    try{
        const {companyId} = req.query;
        if(!companyId){
            return res.status(400).json({
                success:false,
                message:"Company Id is required"
            })
        }
        const format = await ExperienceLetterFormat.findOne({companyId:companyId});
        res.status(200).json({
            success:true,
            data:format,
            message:"Format Fetched Successfully"
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })

    }
}