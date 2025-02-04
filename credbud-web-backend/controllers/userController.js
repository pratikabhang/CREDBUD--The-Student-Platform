const {
  fetchUserProfile,
  verifyToken,
  resetEmailPassword,
  getAllDocuments,
  searchDocuments,
  importUserWithoutPassword,
  searchStudents,firebaseLogin, updateUserProfile,
  updateSemesterByDepartment,
  updateSemesterByAdmissionYear
} = require("../utils/firebase");

const getAll = async (req, res) => {
  try {
    const type = req.body.userType;
    const department = req.body.department;
    const finalDoc = [];
    if (type == "students") {
      const div = req.body.ay;
    }
    data = await getAllDocuments("Sinhgad/users/" + type);
    var keys = Object.values(data);
    // console.log(keys)
    keys.forEach((element) => {
      // console.log(element.data)
      if (element.data.department === department) {
        finalDoc.push(element);
      }
    });
    res.status(200).json({ finalDoc });
  } catch (error) {
    res.status(500).json({ message });
  }
};

const search = async (req, res) => {
  const searchQuery = req.body.searchQuery;
  const searchField = req.body.searchField;
  const userType = req.body.userType;
  const result = await searchStudents(searchQuery, searchField, userType);
  res.status(200).json({ result });
};

// const appLogin = async (req, res) => {
//   try {
//     const { uid, userType } = req.body;
//     // Assuming you have a function to verify the JWT token

//     // Assuming you have a function to check if the user exists in the specified collection
//     const userExists = await fetchUserProfile(userType, uid);

//     if (!userExists) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     // Assuming you have a function to fetch user data from the specified collection

//     res.json(userExists);
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred." + error });
//   }
// };

const getUserProfile = async (req, res) => {
  try {
    // console.log(req)
    const id = req.uid;
    const userType = req.serverUserType;
    const response = await fetchUserProfile(userType, id);
    // console.log(response);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "An error occurred." + error });
  }
};
const registerUser = async (req, res) => {
  try {
    const { email } = req.body;
    const call = await resetEmailPassword(email);
    if (call == true) {
      res.status(200).json({ message: "Activation Link Sent " });
    } else {
      res.status(500).json({ message: "An error occurred." + call });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred." + error });
  }
};

const bulkAdd=async(req,res)=>{
  try {
    const { data } = req.body;
    // console.log(data)
    const call = await importUserWithoutPassword(data);
    if (call == true) {
      res.status(200).json({ message: "Users Imported Sucessfully " });
    } else {
      res.status(500).json({ message: "An error occurred." + call });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred." + error });
  }
}

const updateProfile=async(req,res)=>{
  const usedData= req.body
  const data= updateUserProfile(usedData)
  if (data){
    res.status(200).json({message:"Success"})
  }
  else{
    res.status(200).json({message:"Error"})
  }
}

const updateSemester=async(req,res)=>{
  const {updateType,updatedSem,admissionYear,department}=req.body
  switch (updateType) {
    case "department":
      await updateSemesterByDepartment(department).then(()=>{res.status(200).json({message:'Semesters Updated Sucessfully'})}).catch((e)=>{res.status(400).json({message:'Error Occured',e})})
      break;
    case "admissionYear":
      await updateSemesterByAdmissionYear(admissionYear,updatedSem,department).then(()=>{res.status(200).json({message:'Semesters Updated Sucessfully'})}).catch((e)=>{res.status(400).json({message:'Error Occured',e})})
      break;
    
    default:
      res.status(500).json({message:"Missing Type"})
      break;
  }
}
module.exports = { getUserProfile, registerUser, getAll, search,bulkAdd ,updateProfile,updateSemester};
