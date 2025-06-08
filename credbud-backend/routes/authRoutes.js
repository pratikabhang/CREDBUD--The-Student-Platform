const express = require('express');
const { login,hello} = require('../controllers/authController');
const { extractUidFromBearerToken, serverUserType } = require('../utils/firebase');
const {checkUserType} = require('../middleware/checkUserType');
const router = express.Router()
extractUidFromBearerToken
// Log in a user
router.get('/login',serverUserType, login);
router.post('/verifyCustom', checkUserType('administrators'), async (req, res, next) => {
    try {
       hello(req, res, next); // Assuming hello is your handler for /verifyCustom
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
