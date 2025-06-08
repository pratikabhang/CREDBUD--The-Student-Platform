const { addOrUpdateSubjects, deleteSubjects } = require("../utils/firebase");

const addOrUpSub = async (req,res)=>{
    const subjectData=req.body
    const call =await addOrUpdateSubjects(subjectData)
    if (call){
        res.status(200).json({message:"Subjects Added Successfully"})
    }
    else{
        res.status(501).json({message:"Error While Adding Subjects"})
    }


}
const deleteSub = async (req,res)=>{
    const subjectData=req.body
    const call =await deleteSubjects(subjectData)
    if (call){
        res.status(200).json({message:"Subjects Deleted Successfully"})
    }
    else{
        res.status(501).json({message:"Error While Adding Subjects"})
    }


}

const elective=async(req,res)=>{
    const func = req.params.function
    switch (func) {
        case "activate":
            let {data}=req.body
            
            break;
        case "deactivate":
            
            break;
        case "allocate":
            
            break;
        case "disallocate":
            break;
        default:
            break;
    }
    
}
module.exports={ addOrUpSub,deleteSub}