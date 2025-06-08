const express = require('express');
const  router = express.Router();
const { serverUserType} = require('../utils/firebase');
const { deleteProfile,getStaff,getSubject,updateStaff, allocateSubject, revokeSubject, getSubjectList, getStatC } = require('../controllers/adminController');

router.get("/staff/get",serverUserType,getStaff);
router.post("/staff/delete",serverUserType,deleteProfile);
router.post("/staff/update",serverUserType,updateStaff);
router.post("/staff/subject/allocate",serverUserType,allocateSubject);
router.post("/staff/subject/revoke",serverUserType,revokeSubject);
router.post("/staff/subject/stats",serverUserType,getSubject);
router.post("/staff/subject/all",serverUserType,getSubjectList);
router.get("/stats",getStatC);



module.exports = router;