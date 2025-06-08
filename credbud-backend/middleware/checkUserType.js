// middleware/verifyToken.js

const admin = require('firebase-admin');
const { decodeBase64WithKey } = require('../utils/firebase');

const checkUserType = (requiredType) => {
   return async (req, res, next) => {
      try {
         const authorizationHeader = req.headers['x-api-key'];
         // const idToken = req.headers.authorization;
         // console.log(idToken)
         const token = authorizationHeader;
         type = decodeBase64WithKey(token);
         console.log(type == requiredType);
         if (type == requiredType) {
            return next(); // Proceed to the next middleware (or route handler)
         } else {
            // Send error response if authorization fails
            return res.status(403).json({ message: "Authorization failed" });
         }
      } catch (error) {
         console.log(error);
         return res.status(500).json({ message: "Internal server error" });
      }
   };
};

   // try {

   //    const authorizationHeader = req.headers.authorization;

   //    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
   //       return res.status(401).json({ message: 'Unauthorized' });
   //    }
   //       const idToken = req.headers.authorization;

   //       try {
   //          const decodedToken = await admin.auth().verifyIdToken(idToken);
   //          const user = await admin.auth().getUser(decodedToken.uid);

   //          // Check if user has the required custom claim
   //          if (user.customClaims && user.customClaims.userType === requiredType) {
   //             req.user = user;
   //             next();
   //          } else {
   //              res.status(403).json({ message: 'Unauthorized' });
   //          }
   //       } catch (error) {
   //          res.status(401).json({ message: 'Invalid token' });
   //    };
   // } catch (error) {
   //    return res.json({ message: 'Unauthorized' });
   // }
// };

module.exports = { checkUserType };
