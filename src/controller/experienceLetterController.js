import ExperienceLetter from "../models/ExperienceLetter.js";

// get all experience letter
export const getAllexperienceLetter = async (req,res) =>{
    try{
        const letters = await ExperienceLetter.find().populate('companyId','companyName').sort({createdAt:-1});
        res.status(200).json({
            success:true,
            data:letters
        })
    }
    catch(error){
       res.status(500).json({
        success:false,
        message:error.message
       })
    }
}

// get experience letter by ID
export const getExperienceLetterById = async (req,res) => {
    try {
        const letter = await ExperienceLetter.findById(req.params.id).populate('companyId', 'companyName logo logoKey');
        if(!letter){
            return res.status(404).json({ success: false, message: 'Experience letter not found' });
        }
        res.status(200).json({ success: true, data: letter });
    } catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// created a new experience letter
export const createExperienceLetter = async(req,res) =>{
    try{
      const newLetter = new ExperienceLetter(req.body);
      await newLetter.save();
    //   populate company info before sending response
    await newLetter.populate('companyId','companyName')
    res.status(201).json({
        success:true,
        data:newLetter
    })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// update an existing experience letter
export const updateExperienceLetter =  async(req,res)=>{
    try{
        const updatedLetter = await ExperienceLetter.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).populate('companyId','companyName');
        if(!updatedLetter){
            return res.status(404).json({
                success:false,
                message:'Experience letter not found'
            })
        }
        res.status(200).json({
            success:true,
            data:updatedLetter
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// Delete Experience Letter
export const deleteExperienceLetter = async(req,res) =>{
    try{
        const deleteLetter = await ExperienceLetter.findByIdAndDelete(req.params.id);
        if(!deleteLetter){
            return res.status(404).json({
                success:false,
                message:'Experience letter not found'
            })
        }
        res.status(200).json({
            success:true,
            message:'Experience letter deleted successfully'
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// Generate a unique Refrence Number
export const getNextRefNumber = async(req,res)=>{
    try{
        const year = new Date().getFullYear();
        // count how many letter exits this year
        const count = await ExperienceLetter.countDocuments({
            createdAt:{
                $gte:new Date(`${year}-01-01`),
                $lt:new Date(`${year +1}-01-01`)
            }
        })
        // Formate:EXP_2025_0001
        const nextNum = (count+1).toString().padStart(4,'0');
        const refNumber =`EXP_${year}_${nextNum}`;
        
        return res.status(200).json({
            success:true,
            refNumber
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
