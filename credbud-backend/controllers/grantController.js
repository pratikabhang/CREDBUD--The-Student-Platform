const { firebaseUpdateGrantProfile, firebaseGetSubjectwiseGrantProfile, firebaseUpdateAssignmentStatus, firebaseUpdateExamStatus, firebaseAddRemarksToGrantProfile, firebaseAddExtrasToGrantProfile } = require("../utils/firebase");

const updateAssignmentMarks = async (req, res) => {
  try {
    const assignments = req.body;
    for (const assignment of assignments) {
      const { studentId, subject, marks, assignmentNo } = assignment;
      await firebaseUpdateAssignmentStatus(studentId, subject, marks, assignmentNo);
    }
    res.status(200).json({ message: 'Assignment status updated successfully' });
    // Iterate over each student


  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ error: 'An error occurred while updating assignment status' });
  }

}

const updateExamMarks = async (req, res) => {
  try {
    const assignments = req.body;
    for (const assignment of assignments) {
      const { studentId, subject, marks, exam } = assignment;
      await firebaseUpdateExamStatus(studentId, subject, marks, exam);
    }
    res.status(200).json({ message: 'Assignment status updated successfully' });
    // Iterate over each student


  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ error: 'An error occurred while updating assignment status' });
  }

}

const addExtras = async (req, res) => {
  const {admissionYear,semester,extras}=req.body
  const {userData}=req
  firebaseAddExtrasToGrantProfile(admissionYear, userData.department, semester, extras)
    .then(success => {
      if (success) {
        res.status(200).json({message:'Extras added to grantProfile successfully'});
      } else {
        res.status(400).json({message:'Failed to add extras to grantProfile'});
      }
    })
    .catch(error => {
      res.status(400).json({message:'Failed to add extras to grantProfile'});
      console.error('Error adding extras to grantProfile:', error);
    });
  }
const AddRemarks = async (req, res) => {
  const {message,id}=req.body;
  const {userData}=req;
  console.log(userData);
  firebaseAddRemarksToGrantProfile(id,message,userData)
    .then(success => {
      if (success) {
        res.status(200).json({message:'Remarks added to grantProfile successfully'});
      } else {
        res.status(400).json({message:'Failed to add Remarks to grantProfile'});
      }
    })
    .catch(error => {
      res.status(400).json({message:'Failed to add Remarks to grantProfile'});
      console.error('Error adding remarks to grantProfile:', error);
    });

}


const getSubjectWiseGrantProfile = async (req, res) => {
  const { admissionYear, semester, subject } = req.body
  const call = await firebaseGetSubjectwiseGrantProfile(admissionYear, semester, subject)
  // console.log("THISSS",call)
  if (call) {
    res.status(200).json(call);
  }
  else {
    res.status(400).json("No data was found");

  }
}

module.exports = { updateAssignmentMarks, getSubjectWiseGrantProfile, updateExamMarks,addExtras,AddRemarks };
