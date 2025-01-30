
const { getStaffDetails,getSubjectInfo,updateTeacherProfile,deleteUserProfile, addSubjectToTeacher, deleteSubjectFromTeacher, getAllSubjects, getSubjectStats, getStatCounts } = require('../utils/firebase');

const getStaff = async (req, res) => {
    const {userData}=req
    department =userData.department
    await getStaffDetails(department).then((data)=>{res.status(200).json({data})}).catch((e)=>{res.status(500).json({message:"ERROR OCCURED:",e})})
}
const getSubject = async (req, res) => {
    const {userData}=req
    const {division,subject,semester,subjectYear}=req.body
    department =userData.department
    console.log(department,division,subjectYear,semester,subject)
    await getSubjectStats(department,division,subjectYear,semester,subject).then((data)=>{res.status(200).json({data})}).catch((e)=>{res.status(500).json({message:"ERROR OCCURED:",e})})
}
const getSubjectList = async (req, res) => {
    const {userData}=req
    const {subjectYear}=req.body
    department =userData.department
    await getAllSubjects(userData.department,subjectYear).then((data)=>{res.status(200).json({data})}).catch((e)=>{res.status(500).json({message:"ERROR OCCURED:",e})})
}
const updateStaff = async (req, res) => {
    const {id,updatedProfile}=req.body
    await updateTeacherProfile(id,updatedProfile).then((data)=>{res.status(200).json({message:data})}).catch((e)=>{res.status(500).json({message:"ERROR OCCURED:",e})})
}

const allocateSubject =async(req,res)=>{
    const {id,subject,division,semester,subjectYear}=req.body
    await addSubjectToTeacher(id,subject,division,semester,subjectYear).then((data)=>{res.status(200).json({message:"Allocation Success"})}).catch((e)=>{res.status(500).json({message:"ERROR OCCURED:",e})})
}
const revokeSubject =async(req,res)=>{
    const {id,subject}=req.body
    await deleteSubjectFromTeacher(id,subject).then((data)=>{res.status(200).json({message:"Revoked Successfully"})}).catch((e)=>{res.status(500).json({message:"ERROR OCCURED:",e})})
}

const deleteProfile = async (req, res) => {
    const {id}=req.body
    await deleteUserProfile(id).then((data)=>{res.status(200).json({data})}).catch((e)=>{res.status(500).json({message:"ERROR OCCURED:",e})})
}

const getStatC = async (req, res) => {
    await getStatCounts().then((data)=>{res.status(200).json({data})}).catch((e)=>{res.status(500).json({message:"ERROR OCCURED:",e})})
}




module.exports = {getStaff,updateStaff,deleteProfile,getSubject,allocateSubject,revokeSubject,getSubjectList,getStatC};