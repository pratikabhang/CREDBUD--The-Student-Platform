const express = require('express');
const { getSubjectWiseGrantProfile, updateAssignmentMarks, updateExamMarks, addExtras, AddRemarks} = require('../controllers/grantController');
const router = express.Router();
const { extractUidFromBearerToken,isAdmin, serverUserType} = require('../utils/firebase');
// GET USER PROFILE
router.post('/update/assignments', updateAssignmentMarks);
router.post('/update/exam', updateExamMarks);
router.post('/update/extras',serverUserType, addExtras);
router.post('/update/remarks',serverUserType, AddRemarks);
router.post('/subject',getSubjectWiseGrantProfile);

module.exports = router;
