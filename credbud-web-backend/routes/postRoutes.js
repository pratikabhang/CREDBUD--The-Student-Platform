const express = require('express');
const  router = express.Router();
const { serverUserType} = require('../utils/firebase');
const { createPost, getPosts,verifyPost,my } = require('../controllers/postControllers');

router.post("/create",serverUserType,createPost);
router.get("/",serverUserType,getPosts);
router.get("/my",serverUserType,my);
// router.post("/delete",deletePost);
router.post("/verify",serverUserType,verifyPost);

module.exports = router;