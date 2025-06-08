const express = require('express');
const { markAttendance, createCodes,vipAttendance, fetchAttendance, stats} = require('../controllers/attendanceController');
const router = express.Router();
const { extractUidFromBearerToken,serverUserType} = require('../utils/firebase');

router.post('/mark',serverUserType, markAttendance);
router.post('/createCodes', serverUserType,createCodes);
router.post('/vip',vipAttendance);
router.post('/fetch', serverUserType,fetchAttendance);
router.post('/my', serverUserType,stats);

module.exports = router;
