const express = require('express');
const { getUserProfile,registerUser,appLogin, getAll, search,bulkAdd,updateProfile, updateSemester} = require('../controllers/userController');
const  router = express.Router();
const { extractUidFromBearerToken, serverUserType} = require('../utils/firebase');
const { checkUserType } = require('../middleware/checkUserType');

// GET USER PROFILE

router.get('/profile',serverUserType,getUserProfile);
router.post('/update',serverUserType,updateProfile);
router.post('/activate', registerUser);
// router.post('/appLogin',appLogin );
// router.post('/login',appLogin );
router.post('/getAll',getAll);
router.post('/search',search);
router.post('/add',bulkAdd );
router.post('/updateSemester',updateSemester);

module.exports = router;
