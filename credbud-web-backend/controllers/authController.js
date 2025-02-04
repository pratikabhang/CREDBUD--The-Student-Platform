const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { firebaseTokenLogin } = require('../utils/firebase');
const login = async (req, res) => {
    try {
        const { uid,serverUserType } = req;
        console.log(uid,serverUserType)
        const {user,customToken}= await firebaseTokenLogin(uid,serverUserType)
        if (!user) {
             res.status(401).json({ message: 'Invalid credentials' });
        }
        else{
             res.status(200).json({ user,customToken });
        }
        // const passwordsMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while logging in'+error });
    }

}

const hello = async (req,res)=>{
    return res.status(200).json("Authenticated")
}

module.exports = { login,hello};