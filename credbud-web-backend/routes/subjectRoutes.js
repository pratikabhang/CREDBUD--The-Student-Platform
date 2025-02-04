const express = require('express');
const { getUserProfile,registerUser,appLogin, getAll, search,bulkAdd} = require('../controllers/userController');
const  router = express.Router();
const { extractUidFromBearerToken, serverUserType} = require('../utils/firebase');
const { addOrUpSub, deleteSub, elective} = require('../controllers/subjectController');

router.post("/add",addOrUpSub);
router.post("/delete",deleteSub);
// router.post("/elective/:function",serverUserType,elective);


module.exports = router;