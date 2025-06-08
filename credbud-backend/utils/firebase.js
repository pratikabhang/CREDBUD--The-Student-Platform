// utils/firebase.js

const firebase = require("firebase-admin");
const crypto = require('crypto');

// Initialize Firebase Admin SDK
const authData = {
  "type": process.env.type,
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key?.replace(/\\n/g, '\n'), // important fix
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": process.env.auth_uri,
  "token_uri": process.env.token_uri,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url,
  "universe_domain": process.env.universe_domain
};

if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert(authData),
  });
}

const db = firebase.firestore();
const auth = firebase.auth();

// AES-256 Encryption / Decryption Utility
const ivLength = 16; // For AES, IV is 16 bytes
const cryptographicKey = 'credbud@2022';
const key = crypto.scryptSync(cryptographicKey, 'salt', 32); // 256-bit key

const encodeBase64WithKey = (data) => {
  const iv = crypto.randomBytes(ivLength); // Initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return iv.toString('base64') + ':' + encrypted;
};

const decodeBase64WithKey = (encodedData) => {
  try {
    const [ivBase64, encryptedData] = encodedData.split(':');
    const iv = Buffer.from(ivBase64, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err.message);
    return false;
  }
};

//AUTHENTICATION

async function firebaseTokenLogin(uid, userType) {

  try {
    const userId = uid;
    const user = await fetchUserProfile(userType, userId)
    if (user) {
      const customToken = encodeBase64WithKey(userType, cryptographicKey); //UserType
      return { user, customToken }
    }
  }
  catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  };
}
// firebaseTokenLogin('0dQ72mOsjQVftjNUAWLDss4rIy02','administrators')

async function extractUidFromBearerToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  console.log(authorizationHeader)
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authorizationHeader.substring(7); // Remove 'Bearer ' from the token

  await firebase.auth().verifyIdToken(token)
    .then((decodedToken) => {

      req.uid = decodedToken.uid;
      next();
    })

    .catch((error) => {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    });
}

async function serverUserType(req, res, next, ...authType) {
  const authorizationHeader = req.headers.authorization;
  try {
    let userType = "students";

    console.log(req.route)
    if (req.route.path != "/login") {
      if (!req.headers['x-api-key']) {
        return res.status(401).json({ message: 'Unauthorized: Missing xapi' });
      }
      userType = decodeBase64WithKey(req.headers['x-api-key']);
      console.log(authorizationHeader)
      if (userType != "administrators" && userType != "moderators" && userType != "students") {
        return res.status(401).json({ message: req.path + ' Unauthorized: Missing or invalid token' });
      }
    }
    else {
      userType = req.query.userType;
      console.log(userType)

    }
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: req.path + 'Unauthorized: Authorization Header Missing' });
    }

    const token = authorizationHeader.substring(7); // Remove 'Bearer ' from the token

    try {
      const decodedToken = await firebase.auth().verifyIdToken(token);
      console.log(decodedToken.uid);
      req.uid = decodedToken.uid;
      const profile = await fetchUserProfile(userType, req.uid);
      const hasProfile = profile && profile !== null;
      console.log(req.uid, hasProfile)

      switch (true) {
        case hasProfile:
          req.serverUserType = userType;
          req.userData = profile;
          break;
        default:
          throw new Error('No user profile found');
      }
      next();
    } catch (error) {
      console.log('Error verifying token:', error);
      return res.status(401).json({ message: 'Unauthorized: ' + error });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid key ' + error });
  }


}

async function resetEmailPassword(email) {
  const useremail = email;
  getAuth.generateEmailVerificationLink(useremail)
    .then((link) => {
      // Construct email verification template, embed the link and send
      // using custom SMTP server.
      // return getAuth.sendCustomVerificationEmail();
      firebase.auth().sendPasswordResetEmail(email, { url: link });
    })
    .catch((error) => {
      // Some error occurred.
      console.log(error)
    });
}


async function fetchUserProfile(type, id) {
  try {
    let response = {};
    console.log(`Sinhgad/users/${type}`);
    const userDocRef = db.collection(`Sinhgad/users/${type}`).doc(id);

    const userDocSnapshot = await userDocRef.get();

    if (userDocSnapshot.exists) {
      const res = { 'id': userDocSnapshot.id, ...userDocSnapshot.data() };
      if (type === "student") {
        const grantProfileArray = JSON.parse(res.grantProfile);
        const response = {
          ...res,
          grantProfile: grantProfileArray, // Include parsed grantProfile here
        };
        return response;
      }

      // Assuming userDocSnapshot contains user data including grantProfile
      const response = {
        ...res, // Include parsed grantProfile here
      };

      // console.log(response);
      return response;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}
async function getAttendanceByStudent(studentid, dept, division, admissionYear) {
  try {

    const documentSnapshot = await firebase.firestore().collection(`Sinhgad/attendance/${admissionYear}/${dept}/attendance`).get();

    const attendanceData = documentSnapshot.docs.map(doc => ({
      date: doc.id,
      attendance: (doc.data()[division] || {}) || {}
    }));
    console.log(attendanceData)
    const studentAttendance = attendanceData.reduce((acc, dayAttendance) => {
      const subjectsConducted = Object.keys(dayAttendance.attendance);
      const subjectsAttended = subjectsConducted.filter(subject => dayAttendance.attendance[subject].includes(studentid));

      const day = {
        date: new Date(parseInt(dayAttendance.date)),
        subjectsConducted,
        subjectsAttended
      };

      acc.push(day);
      return acc;
    }, []);

    return (studentAttendance);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
  }
}
// getAttendanceByStudent("ABCDE21",'Computer',"A",2020)

async function getAttendanceBySubject(subject, dept, division, admissionYear) {
  try {

    const documentSnapshot = await firebase.firestore().collection(`Sinhgad/attendance/${admissionYear}/${dept}/attendance`).get();

    const attendanceData = documentSnapshot.docs.map(doc => ({
      date: doc.id,
      attendance: (doc.data()[division][subject] || {}) || {}
    }));
    console.log(attendanceData)
    const studentAttendance = attendanceData.reduce((acc, dayAttendance) => {
      const subjectsConducted = Object.keys(dayAttendance.attendance);
      const subjectsAttended = subjectsConducted.filter(subject => dayAttendance.attendance[subject]);

      const day = {
        date: new Date(parseInt(dayAttendance.date)),
        subjectsConducted,
        subjectsAttended
      };

      acc.push(day);
      return acc;
    }, []);

    return (attendanceData);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
  }
}

async function getAttendanceByDivision(dept, division, admissionYear) {
  try {

    const documentSnapshot = await firebase.firestore().collection(`Sinhgad/attendance/${admissionYear}/${dept}/attendance`).get();

    const attendanceData = documentSnapshot.docs.map(doc => ({
      date: doc.id,
      attendance: (doc.data()[division] || {}) || {}
    }));
    // const studentAttendance = attendanceData.reduce((acc, dayAttendance) => {
    //   console.log(dayAttendance)
    //   const subjectsConducted = Object.keys(dayAttendance.attendance);
    //   const subjectsAttended = subjectsConducted.filter(subject => dayAttendance.attendance[division]);
    //   console.log(subjectsAttended)

    //   const day = {
    //     date: new Date(parseInt(dayAttendance.id)),
    //     subjectsConducted,
    //     subjectsAttended
    //   };

    //   acc.push(day);
    //   return acc;
    // }, []);

    return (attendanceData);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
  }
}

async function searchDocuments(searchString) {
  try {
    const firestore = firebase.firestore();
    let query = firestore.collection("Sinhgad/users/administrators");

    // Perform a partial text search using '>=', '<=' for the prefix
    if (searchString) {
      const endString = searchString + '\uf8ff';
      query = query.where('name', '>=', searchString).where('name', '<=', endString);
    }

    const querySnapshot = await query.get();

    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        data: doc.data(),
      });
    });

    // console.log('Search results:', results);
    return results;
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}

async function searchStudents(searchQuery, searchField, userType) {
  try {
    const firestore = firebase.firestore();
    if (!userType) {
      userType = "students";//deafult user type
    }
    let query = firestore.collection("Sinhgad/users/" + userType);

    // Perform a partial search across the specified field
    if (searchQuery && searchField) {
      // Convert the search query to lowercase for case-insensitive search
      const lowerCaseSearchQuery = searchQuery

      // Use logical OR condition for string fields
      if (searchField === 'name' || searchField === 'email' || searchField === 'contact' || searchField === 'id') {
        query = query
          .where(searchField, '>=', lowerCaseSearchQuery)
          .where(searchField, '<=', lowerCaseSearchQuery + '\uf8ff');
      }
      // Use exact match for other fields
      else {
        query = query.where(searchField, '==', lowerCaseSearchQuery);
      }
    }

    const querySnapshot = await query.get();

    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        data: doc.data(),
      });
    });

    console.log('Search results:', results);
    return results;
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
}


async function getAllDocuments(collectionName) {
  try {
    const firestore = firebase.firestore();
    const collectionRef = firestore.collection(collectionName);

    const querySnapshot = await collectionRef.get();

    const documents = [];
    querySnapshot.forEach((doc) => {
      data = doc.data()
      documents.push({
        data
      });
    });

    return documents;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}



//USER
// const getGrantProfile = async (department, year) => {
//   const finalDoc = [];
//   const grantProfile = [];

//   for (let i = 1; i <= 8; i++) {
//     const collectionRef = firebase.firestore().collection(`Sinhgad/attendance/${year}/${department}/subjects/all/${i}`);
//     const querySnapshot = await collectionRef.get();

//     const subjectDoc = [];

//     await querySnapshot.forEach((doc) => {
//       data = doc.data();
//       // console.log((data))
//       const assignmentsArray = data.subjectIsPractical ?

//         Array(data.subjectPracticalAssigments).fill(0) :
//         Array(data.subjectTheoryAssignments).fill(0);
//       subjectDoc.push({ [doc.id]: assignmentsArray });
//     });
//     console.log(subjectDoc)
//     finalDoc.push(subjectDoc);
//   }

//   // Log the internal object for the third semester (index 2)
//   return (finalDoc)
// };
// const getGrantProfile = async (department, year) => {
//   const finalDoc = [];

//   for (let i = 1; i <= 8; i++) {
//     const collectionRef = firebase.firestore().collection(`Sinhgad/attendance/${year}/${department}/subjects/all/${i}`);
//     const querySnapshot = await collectionRef.get();

//     const subjectDoc = [];

//     await querySnapshot.forEach((doc) => {
//       const data = doc.data();

//       const assignmentsArray = data.subjectIsPractical ?
//         Array(data.subjectPracticalAssignments).fill(0) :
//         Array(data.subjectTheoryAssignments).fill(0);

//       const subjectInfo = {
//         subjectMiniProjects: data.subjectMiniProjects > 0 ? Array(data.subjectMiniProjects).fill(0) : null,
//         subjectIsElective: data.subjectIsElective ? { selectedSubject: {}, subjectElectiveChoices: data.subjectElectiveChoices } : null,
//         assignmentsArray: assignmentsArray,
//         utData:{
//           utTotal: data.utTotal || 0,
//           utPassing: data.utPassing || 0,
//           isFailed: data.isFailed || false,
//           isReappeared: data.isReappeared || false,
//         },
//         prelimData:{
//           prelimTotal: data.prelimTotal || 0,
//           prelimPassing: data.prelimPassing || 0,
//           isFailed: data.isFailed || false,
//           isReappeared: data.isReappeared || false,
//         }
//       };

//       subjectDoc.push({ [doc.id]: subjectInfo });
//     });

//     finalDoc.push(subjectDoc);
//   }
//   console.log(finalDoc)
//   return finalDoc;
// };

// const getGrantProfile = async (department, year) => {
//   const finalDoc = [];

//   for (let i = 1; i <= 8; i++) {
//     const collectionRef = firebase.firestore().collection(`Sinhgad/attendance/${year}/${department}/subjects/all/${i}`);
//     const querySnapshot = await collectionRef.get();

//     const subjectDoc = [];

//     await querySnapshot.forEach((doc) => {
//       const data = doc.data();

//       const assignmentsArray = data.subjectIsPractical ?
//         Array(data.subjectPracticalAssignments).fill(0) :
//         Array(data.subjectTheoryAssignments).fill(0);

//       const subjectInfo = {
//         subjectMiniProjects: data.subjectMiniProjects > 0 ? Array(data.subjectMiniProjects).fill(0) : null,
//         subjectIsElective: data.subjectIsElective ? { selectedSubject: "", subjectElectiveChoices: data.subjectElectiveChoices } : null,
//         assignmentsArray: assignmentsArray,
//         utData: {
//           utMarks: 0,
//           utTotal: data.utTotal || 0,
//           utPassing: data.utPassing || 0,
//           isFailed: data.isFailed || false,
//           isReappeared: data.isReappeared || false,
//         },
//         prelimData: {
//           prelimMarks: 0,
//           prelimTotal: data.prelimTotal || 0,
//           prelimPassing: data.prelimPassing || 0,
//           isFailed: data.isFailed || false,
//           isReappeared: data.isReappeared || false,
//         }
//       };

//       subjectDoc.push({ [doc.id]: subjectInfo });
//     });

//     finalDoc.push(subjectDoc);
//   }
//   // console.log(finalDoc)
//   return finalDoc;
// };
async function countDocuments(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.size;
  } catch (error) {
    console.error('Error counting documents:', error);
    throw error;
  }
}
const getStatCounts = async () => {
  let data = {
    moderators: 0,
    administrators: 0,
    students: 0,
  }
  await countDocuments('Sinhgad/users/students')
    .then(count => data.students = count)
    .catch(error => console.error('Error:', error));
  await countDocuments('Sinhgad/users/moderators')
    .then(count => data.moderators = count)
    .catch(error => console.error('Error:', error));
  await countDocuments('Sinhgad/users/administrators')
    .then(count => data.administrators = count)
    .catch(error => console.error('Error:', error));
  return data


}


const getGrantProfile = async (department, year) => {
  const finalDoc = [];

  for (let i = 1; i <= 8; i++) {
    const collectionRef = firebase.firestore().collection(`Sinhgad/attendance/${year}/${department}/subjects/`);
    const querySnapshot = await collectionRef.where('semester', '==', i).get();
    // const querySnapshot = await collectionRef.get();

    const subjectDoc = [];

    await querySnapshot.forEach((doc) => {
      const data = doc.data();
      const assignmentsArray = data.subjectIsPractical ? Array(data.subjectPracticalAssignments).fill(0) : Array(data.subjectTheoryAssignments).fill(0);

      const subjectInfo = {
        subjectMiniProjects: data.subjectMiniProjects > 0 ? Array(data.subjectMiniProjects).fill(0) : null,
        subjectIsElective: data.subjectIsElective ? { selectedSubject: "", subjectElectiveChoices: data.subjectElectiveChoices, selectionAvailable: false, selectionDue: null } : null,
        assignmentsArray: assignmentsArray,
        utData: {
          utMarks: 0,
          utTotal: data.utTotal || 0,
          utPassing: data.utPassing || 0,
          isFailed: data.isFailed || false,
          isReappeared: data.isReappeared || false,
        },
        prelimData: {
          prelimMarks: 0,
          prelimTotal: data.prelimTotal || 0,
          prelimPassing: data.prelimPassing || 0,
          isFailed: data.isFailed || false,
          isReappeared: data.isReappeared || false,
        }
      };

      subjectDoc.push({ [data.subjectInitial]: subjectInfo });
    });

    finalDoc.push(subjectDoc);
  }
  console.log(finalDoc[7][5])
  return finalDoc;
};



// getGrantProfile("Computer", 2020)
const addUserDataToFirestore = async (userData) => {
  try {
    // Add user data to Firestore
    const userRef = firebase.firestore().collection(`Sinhgad/users/${userData.type}`);
    if (userData.type === "students") {

      await Promise.all(userData.users.map(async (user) => {
        // Create a new document for each user
        const grantProfileD = await getGrantProfile(user.branch, user.AY);
        const flattenedGrantProfile = {};
        const array = {};
        // console.log(grantProfileD)
        grantProfileD.forEach((semesterCourses, index) => {
          const semesterNumber = index + 1;
          const semesterCoursesObject = {};
          semesterCourses.forEach(course => {
            const courseName = Object.keys(course)[0];
            const data = course[courseName] || [];
            semesterCoursesObject[courseName] = data;
          });
          flattenedGrantProfile[semesterNumber] = semesterCoursesObject;
          array[semesterNumber] = {};
        });
        if (true) {
          // console.log("Here")
          await userRef.doc(user.uid).set({
            id: user.uid,
            name: user.name,
            parentsContact: `+91${user.parentsContact}`,
            email: user.altEmail,
            admissionYear: user.AY,
            division: user.division || "A",
            contact: `+91${user.contact}`,
            credPoints: { balance: 0, profitHistory: [], redeemHistory: [] },
            cgpa: 0, // Default value, update as needed
            currentSem: user.currentSem, // Default value, update as needed
            grantProfile: flattenedGrantProfile,
            grantProfileExtras: array,
            department: user.branch,
          });

          console.log(`Document created for user: ${user.uid}`);
        }
      }));

      console.log('Students data added to Firestore successfully');

    }
    if (userData.type === "moderators") {
      console.log(`Sinhgad/users/${userData.type}`)

      await Promise.all(userData.users.map(async (user) => {
        if (!user.uid || !user.name || !user.altEmail || !user.mobile || !user.designation || !user.department) {
          console.warn('Skipping incomplete teacher data:', user);
          return; // Skip this teacher
        }

        else {
          console.log({
            id: user.uid,
            name: user.name,
            email: user.altEmail,
            contact: user.mobile,
            tempAdmin: { isAdmin: false, expiresOn: "", customRights: "" },
            subjectsAllocated: user.subjectsAllocated,
            isTeaching: user.isTeaching,
            designation: user.designation,
            department: user.branch,
          })
          await userRef.doc(user.uid).set({
            id: user.uid,
            name: user.name,
            email: user.altEmail,
            contact: user.mobile,
            subjectsAllocated: {},
            tempAdmin: { isAdmin: false, expiresOn: null, customRights: null },
            isTeaching: true,
            designation: user.designation,
            department: user.department,
          });

          console.log(`Document created for user: ${user.uid}`);
        }

        // Create a new document for each user

      }));

      console.log('User data added to Firestore successfully');
    }
    else if (userData.type === "administrators") {
      await Promise.all(userData.users.map(async (teacher) => {
        // Create a new document for each teacher
        await userRef.doc(teacher.uid).set({
          id: teacher.uid,
          name: teacher.name,
          email: teacher.altEmail,
          contact: teacher.mobile,
          subjectsAllocated: teacher.subjectsAllocated,
          isTeaching: teacher.isTeaching,
          designation: teacher.designation,
          department: teacher.branch
        });

        console.log(`Document created for teacher: ${teacher.uid}`);
      }));
    }
  } catch (error) {
    console.error('Error adding user data to Firestore:', error);
    return false
  }
};


const importUserWithoutPassword = async (data) => {
  try {
    // Import user with minimal data (no password)
    console.log(data)
    const userRecord = await firebase.auth().importUsers(data.users.map(user => ({
      uid: user.uid,
      email: user.altEmail,
      provider: 'email',
    })));

    console.log('Successfully imported users without password:', userRecord.successCount);

    // Add user data to Firestore
    const request = await addUserDataToFirestore(data);
    return true;
  } catch (error) {
    console.error('Error importing users:', error);
    return false;
  }
};


const updateUserProfile = async (userData) => {
  try {
    // Add user data to Firestore
    // const userRef = firebase.firestore().collection(`Sinhgad/users/${userData.type}`);
    console.log(userData);
    const userRef = firebase.firestore().collection(`Sinhgad/users/${userData.type}`).doc(userData.id);
    await userRef.update(userData.userData);

    console.log('Students data updated to Firestore successfully');
    return true
  } catch (error) {
    console.error('Error upadating user data to Firestore:', error);
    return false
  }
}

async function updateSemesterByDepartment(department) {
  try {
    // Query all student profiles belonging to the specified department
    const querySnapshot = await db.collection('Sinhgad/users/students').where('department', '==', department).get();

    // Iterate through each profile and update the semester
    querySnapshot.forEach(async (doc) => {
      const profileRef = doc.ref;
      const profileData = doc.data();

      // Increment the semester by one
      const newSemester = profileData.currentSem + 1;

      // Update the semester in the profile
      await profileRef.update({
        currentSem: newSemester
      });

      console.log(`Semester updated for student ${profileData.studentId} in department ${department}`);
    });

    console.log("All student semesters updated successfully.");
    return true
  } catch (error) {
    console.error("Error updating student semesters:", error);
    throw (error)
  }
}
async function updateSemesterByAdmissionYear(year, setSemester, department) {
  try {
    // Query all student profiles belonging to the specified department
    const querySnapshot = await db.collection('Sinhgad/users/students').where('department', '==', department).where('admissionYear', '==', year).get();

    // Iterate through each profile and update the semester
    querySnapshot.forEach(async (doc) => {
      const profileRef = doc.ref;
      const profileData = doc.data();

      // Increment the semester by one
      const newSemester = setSemester;

      // Update the semester in the profile
      await profileRef.update({
        currentSem: newSemester
      });

      console.log(`Semester updated for student ${profileData.id} in department ${department}`);
    });

    console.log("All student semesters updated successfully.");
    return true
  } catch (error) {
    console.error("Error updating student semesters:", error);
    throw error
  }
}

// Example usage
// const userData = {
//     type: 'students',
//     users: [
//         {
//             "uid": "ABCDE20",
//             "name": "Vinay Nivrutti Tiparadi",
//             "AY": 2020,
//             "branch": "Computer",
//             "altEmail": "rsm234@mailnesia.com",
//             "mobile": "9028322992"
//           },
//           {
//             "uid": "BCDEF20",
//             "name": "Karan Jagdish Keche",
//             "AY": 2020,
//             "branch": "Computer",
//             "altEmail": "rsm345@mailnesia.com",
//             "mobile": "9028322991"
//           },
//           {
//             "uid": "CDEFG20",
//             "name": "Rohan the CoolKarni",
//             "AY": 2020,
//             "branch": "Computer",
//             "altEmail": "rsm456@mailnesia.com",
//             "mobile": "9028322990"
//           },
//           {
//             "uid": "ABCDE21",
//             "name": "Pranav Walgude",
//             "AY": 2020,
//             "branch": "Computer",
//             "altEmail": "rsm567@mailnesia.com",
//             "mobile": "9028322989"
//           },
//           {
//             "uid": "BCDEF21",
//             "name": "Rushikesh Muley",
//             "AY": 2020,
//             "branch": "Computer",
//             "altEmail": "rsm789@mailnesia.com",
//             "mobile": "9028322988"
//           }
//     ],
// };

//  const userData = {
//     type: 'administrators',
//     users: [
//         {
//             "uid": "TEC20",
//             "name": "Vidya Shinde",
//             "branch": "Computer",
//             "altEmail": "teacher234@mailnesia.com",
//             "mobile": "9028322992",
//             "subjectsAllocated": ["LP1", "LP3"],
//             "isTeaching": true,
//             "designation": "Assistant Professor"
//           },
//           {
//             "uid": "TEC21",
//             "name": "Asmita Kamble",
//             "branch": "Computer",
//             "altEmail": "teacher45@mailnesia.com",
//             "mobile": "9028322991",
//             "subjectsAllocated": ["LP4"],
//             "isTeaching": true,
//             "designation": "Assistant Professor"
//           },
//           {
//             "uid": "TEC22",
//             "name": "Sucheta Navale",
//             "branch": "Computer",
//             "altEmail": "teacher456@mailnesia.com",
//             "mobile": "9028322990",
//             "subjectsAllocated": ["ML", "DSA"],
//             "isTeaching": true,
//             "designation": "Assistant Professor"
//           },
//           {
//             "uid": "TEC23",
//             "name": "Sachin Dighe",
//             "branch": "Computer",
//             "altEmail": "teacher567@mailnesia.com",
//             "mobile": "9028322989",
//             "subjectsAllocated": ["BT", "CG"],
//             "isTeaching": true,
//             "designation": "Assistant Professor"
//           },
//           {
//             "uid": "TEC24",
//             "name": "Rupali Waghmode",
//             "branch": "Computer",
//             "altEmail": "teacher789@mailnesia.com",
//             "mobile": "9028322988",
//             "subjectsAllocated": ["MP"],
//             "isTeaching": true,
//             "designation": "Assistant Professor"
//           }
//     ],
// };
//  const userData = {
//     type: 'administrators',
//     users: [
//         {
//             "uid": "0dQ72mOsjQVftjNUAWLDss4rIy02",
//             "name": "Rushikesh Muley",
//             "branch": "Computer",
//             "altEmail": "rsm99123@gmail.com",
//             "mobile": "7620579941",
//             "subjectsAllocated": ["LP1", "LP3"],
//             "isTeaching": true,
//             "designation": "Assistant Professor"
//           }
//     ],
// };
// importUserWithoutPassword(userData);

// Example usage
// importUserWithoutPassword('otstufftemp@gmail.com');


// addUserDataToFirestore(userData);
console.log("")
// const addOrUpdateSubjects = async (subjectData) => {
//   try {
//     // console.log(subjectData)

//     await Promise.all(subjectData.map(async (subject) => {


//       // console.log(dat)
//       console.log(`/Sinhgad/attendance/${subject.subjectYear}/${subject.subjectDepartment}/subjects/all/${subject.subjectSem}/${subject.subjectInitial}`)
//       const subjectDocRef = firebase.firestore().doc(`/Sinhgad/attendance/${subject.subjectYear}/${subject.subjectDepartment}/subjects/all/${subject.subjectSem}/${subject.subjectInitial}`);
//       // const subjectDocRef = subjectsRef.doc(`${subject.subjectSem} /${subject.subjectInitial}`);

//       const existingSubjectDoc = await subjectDocRef.get();
//       if (existingSubjectDoc.exists) {
//         // Subject already exists, update if needed
//         console.log(`Subject ${subject.subjectInitial} for ${subject.subjectDepartment}, Sem-${subject.subjectSem} already exists. Updating if needed.`);
//         await subjectDocRef.update({
//           subjectName: subject.subjectName,
//           subjectPattern: subject.subjectPattern,
//           subjectPracticalAssigments: subject.subjectPracticalAssigments,
//           subjectTheoryAssignments: subject.subjectTheoryAssignments,
//           subjectIsPractical: subject.subjectIsPractical,
//           subjectMiniProjects: subject.subjectMiniProjects,
//           subSubjects: subject.subSubjects,
//           subjectIsElective: subject.subjectIsElective,
//           subjectElectiveChoices: subject.subjectElectiveChoices,
//           subSubjectNames: subject.subSubjectNames,
//           subjectIsHonours: subject.subjectIsHonours,
//           utTotal: subject.utTotal,
//           utPassing: subject.utTotal,
//           prelimTotal: subject.prelimTotal,
//           prelimPassing: subject.prelimPassing
//         });

//         // console.log({})
//         // Update logic here if needed

//       } else {
//         // Subject doesn't exist, add it
//         // console.log(`Adding new subject ${subject.subjectInitial} for ${subject.subjectDepartment}, Sem-${subject.subjectSem}.`);

//         await subjectDocRef.set({
//           subjectName: subject.subjectName,
//           subjectPattern: subject.subjectPattern,
//           subjectPracticalAssigments: subject.subjectPracticalAssigments,
//           subjectTheoryAssignments: subject.subjectTheoryAssignments,
//           subjectIsPractical: subject.subjectIsPractical,
//           subjectMiniProjects: subject.subjectMiniProjects,
//           subSubjects: subject.subSubjects,
//           subjectIsElective: subject.subjectIsElective,
//           subjectElectiveChoices: subject.subjectElectiveChoices,
//           subSubjectNames: subject.subSubjectNames,
//           subjectIsHonours: subject.subjectIsHonours,
//           utTotal: subject.utTotal,
//           utPassing: subject.utTotal,
//           prelimTotal: subject.prelimTotal,
//           prelimPassing: subject.prelimPassing
//         });
//       }
//     }));
//     console.log('Subjects added or updated successfully');
//     return true
//   } catch (error) {
//     console.error('Error adding or updating subjects:', error);
//     return false
//   }
// };

const addOrUpdateSubjects = async (subjectData) => {
  try {

    await Promise.all(subjectData.map(async (subject) => {

      const querySnapshot = await firebase.firestore().collection(`Sinhgad/attendance/${subject.subjectYear}/${subject.subjectDepartment}/subjects/`)
        .where('subjectName', '==', subject.subjectName)
        // .where('subjectInitial', '==', subject.subjectInitial)
        .where('semester', '==', subject.subjectSem)
        .get();
      console.log(querySnapshot.docs, subject.subjectInitial)
      if (!querySnapshot.empty) {
        // If a subject with the same name, ID, and semester exists, update it
        const subjectDocRef = querySnapshot.docs[0].ref;

        await subjectDocRef.update({
          subjectInitial: subject.subjectInitial,
          subjectName: subject.subjectName,
          subjectPattern: subject.subjectPattern,
          subjectPracticalAssignments: subject.subjectPracticalAssignments,
          subjectTheoryAssignments: subject.subjectTheoryAssignments,
          subjectIsPractical: subject.subjectIsPractical,
          subjectMiniProjects: subject.subjectMiniProjects,
          subSubjects: subject.subSubjects,
          subjectIsElective: subject.subjectIsElective,
          subjectElectiveChoices: subject.subjectElectiveChoices,
          subSubjectNames: subject.subSubjectNames,
          subjectIsHonours: subject.subjectIsHonours,
          utTotal: subject.utTotal,
          utPassing: subject.utTotal,
          prelimTotal: subject.prelimTotal,
          prelimPassing: subject.prelimPassing,
          semester: subject.subjectSem
        });

        console.log(`Subject ${subject.subjectName} for ID ${subject.subjectInitial} and Semester ${subject.subjectSem} already exists. Updating.`);
      } else {
        // If no matching subject found, add a new one
        console.log(`Subject ${subject.subjectName} for ID ${subject.subjectInitial} and Semester ${subject.subjectSem} not found. Adding new subject.`);

        await firebase.firestore().collection(`Sinhgad/attendance/${subject.subjectYear}/${subject.subjectDepartment}/subjects/`).add({
          subjectName: subject.subjectName,
          subjectInitial: subject.subjectInitial,
          subjectPattern: subject.subjectPattern,
          subjectPracticalAssignments: subject.subjectPracticalAssignments,
          subjectTheoryAssignments: subject.subjectTheoryAssignments,
          subjectIsPractical: subject.subjectIsPractical,
          subjectMiniProjects: subject.subjectMiniProjects,
          subSubjects: subject.subSubjects,
          subjectIsElective: subject.subjectIsElective,
          subjectElectiveChoices: subject.subjectElectiveChoices,
          subSubjectNames: subject.subSubjectNames,
          subjectIsHonours: subject.subjectIsHonours,
          utTotal: subject.utTotal,
          utPassing: subject.utTotal,
          prelimTotal: subject.prelimTotal,
          prelimPassing: subject.prelimPassing,
          semester: subject.subjectSem // Add semester field
        });
      }
    }));


    console.log('Subjects added or updated successfully');
    return true;
  } catch (error) {
    console.error('Error adding or updating subjects:', error);
    return false;
  }
};

// addOrUpdateSubjects(subjectData)
// Example usage

// 7const subjectData=[
//   {
//       "subjectInitial": "DAA",
//       "subjectName": "Design and Analysis Of Algorithm",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 0,
//       "subjectTheoryAssignments": 6,
//       "subjectIsPractical": false,
//       "subjectMiniProjects": 0,
//       "subSubjects": 0,
//       "subjectIsElective": false,
//       "subjectElectiveOptions": null,
//       "subSubjectNames": null,
//       "subjectIsHonours": false

//   },
//   {
//       "subjectInitial": "BT",
//       "subjectName": "Blockchain Technology",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 0,
//       "subjectTheoryAssignments": 6,
//       "subjectIsPractical": false,
//       "subjectMiniProjects": 0,
//       "subSubjects": 0,
//       "subjectIsElective": false,
//       "subjectElectiveOptions": null,
//       "subSubjectNames": null,
//       "subjectIsHonours": false
//   },
//   {
//       "subjectInitial": "ML",
//       "subjectName": "Machine Learning",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 0,
//       "subjectTheoryAssignments": 6,
//       "subjectIsPractical": false,
//       "subjectMiniProjects": 0,
//       "subSubjects": 0,
//       "subjectIsElective": false,
//       "subjectElectiveOptions": null,
//       "subSubjectNames": null,
//       "subjectIsHonours": false
//   },
//   {
//       "subjectInitial": "EL3",
//       "subjectName": "Elective 3",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 0,
//       "subjectTheoryAssignments": 6,
//       "subjectIsPractical": false,
//       "subjectMiniProjects": 0,
//       "subSubjects": 4,
//       "subjectIsElective": true,
//       "subjectElectiveOptions": "Pervasive Computing,Multimedia Techniques,Cyber Security And Digital Forensics ,Object Oriented Modeling And Design ,Digital Signal Processing",
//       "subSubjectNames": null,
//       "subjectIsHonours": false
//   },
//   {
//       "subjectInitial": "EL4",
//       "subjectName": "Elective 4",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 0,
//       "subjectTheoryAssignments": 6,
//       "subjectIsPractical": false,
//       "subjectMiniProjects": 2,
//       "subSubjects": 4,
//       "subjectIsElective": true,
//       "subjectElectiveOptions": "Information Retrieval, GPU Programming And Architecture, Mobile Computing , Software Testing And Quality Assurance",
//       "subSubjectNames": null,
//       "subjectIsHonours": false
//   },
//   {
//       "subjectInitial": "LP3",
//       "subjectName": "Labrotary Practice 3",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 12,
//       "subjectTheoryAssignments": 0,
//       "subjectIsPractical": true,
//       "subjectMiniProjects": 3,
//       "subSubjects": 2,
//       "subjectIsElective": false,
//       "subjectElectiveOptions": null,
//       "subSubjectNames": "Design and Analysis of Algorithms, Machine Learning",
//       "subjectIsHonours": null
//   },
//   {
//       "subjectInitial": "LP4",
//       "subjectName": "Labrotary Practice 4",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 10,
//       "subjectTheoryAssignments": 0,
//       "subjectIsPractical": true,
//       "subjectMiniProjects": 2,
//       "subSubjects": 2,
//       "subjectIsElective": false,
//       "subjectElectiveOptions": null,
//       "subSubjectNames": "Elective 3, Elective 4",
//       "subjectIsHonours": false
//   },
//   {
//       "subjectInitial": "PS1",
//       "subjectName": "Project Stage I",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 0,
//       "subjectTheoryAssignments": 0,
//       "subjectIsPractical": true,
//       "subjectMiniProjects": 0,
//       "subSubjects": 0,
//       "subjectIsElective": false,
//       "subjectElectiveOptions": null,
//       "subSubjectNames": null,
//       "subjectIsHonours": false
//   },
//   {
//       "subjectInitial": "AC7",
//       "subjectName": "Audit Course",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 0,
//       "subjectTheoryAssignments": 0,
//       "subjectIsPractical": true,
//       "subjectMiniProjects": 0,
//       "subSubjects": 0,
//       "subjectIsElective": false,
//       "subjectElectiveOptions": null,
//       "subSubjectNames": null,
//       "subjectIsHonours": false
//   },
//   {
//       "subjectInitial": "HN",
//       "subjectName": "Honor",
//       "subjectYear": 2020,
//       "subjectPattern": "2019 Credit Pattern",
//       "subjectDepartment": "Computer",
//       "subjectSem": 7,
//       "subjectPracticalAssigments": 0,
//       "subjectTheoryAssignments": 0,
//       "subjectIsPractical": "TURE",
//       "subjectMiniProjects": 0,
//       "subSubjects": 4,
//       "subjectIsElective": false,
//       "subjectElectiveOptions": null,
//       "subSubjectNames": null,
//       "subjectIsHonours": true
//   }
// ]

// addOrUpdateSubjects(subjectData)
// 8const subjectData = {
//     
//       {
//           "subjectInitial": "HPC",
//           "subjectName": "High Performance Computing",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 8,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": 0,
//           "subSubjectNames": 0,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "DL",
//           "subjectName": "Deep Learning",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 8,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "EL5",
//           "subjectName": "Elective 5",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 8,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": true,
//           "subjectElectiveOptions": "Natural Language Processing, Image Processing, Software Defined Networks, Advanced Digital Signal Processing, Open Elective I",
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "EL6",
//           "subjectName": "Elective 6",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 8,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": true,
//           "subjectElectiveOptions": "Pattern Recognition, Soft Computing, Buisness Intelligence, Quantum Computing, Open Elective II",
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "LP5",
//           "subjectName": "Labrotary Practice 5",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 8,
//           "subjectPracticalAssigments": 7,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 2,
//           "subSubjects": 2,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": "High Performance Computing, Deep Learning",
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "LP6",
//           "subjectName": "Labrotary Practice 6",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 8,
//           "subjectPracticalAssigments": 10,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 2,
//           "subSubjects": 2,
//           "subjectIsElective": true,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": "Elective 5, Elective 6",
//           "subjectIsHonours": false
//       }
//   
// };
// 4const subjectData = {
//
//       {
//           "subjectInitial": "EM-II",
//           "subjectName": "Engineering Mathematics III",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "DSA",
//           "subjectName": "Data Structures and Algorithms",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "SE",
//           "subjectName": "Software Engineering",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "MP",
//           "subjectName": "Microprocessor",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "PPL",
//           "subjectName": "Principles of Programming Languages",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "DSAL",
//           "subjectName": "Data Structures and Algorithms Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 12,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "MPL",
//           "subjectName": "Microprocessor Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 15,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "PBL-II",
//           "subjectName": "Project Based Learning II",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 1,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "CC",
//           "subjectName": "Code of Conduct",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "AC4",
//           "subjectName": "Audit Course 4",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 4,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       }
//
// };
// 6const subjectData = {
//     
//       {
//           "subjectInitial": "DSBDA",
//           "subjectName": "Data Science and Big Data Analytics",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "WT",
//           "subjectName": "Web Technology",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "AI",
//           "subjectName": "Artificial Intelligence",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "EL-II",
//           "subjectName": "Elective II",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 4,
//           "subjectIsElective": true,
//           "subjectElectiveOptions": "Information Security, Augmented and Virtual Reality,Cloud Computing,Software Modeling and Architectures",
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "INTERN",
//           "subjectName": "Internship",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": null,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "DSBDL",
//           "subjectName": "Data Science and Big Data Analytics Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 14,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 2,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "WTL",
//           "subjectName": "Web Technology Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": 10,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 1,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "LP-II",
//           "subjectName": "Laboratory Practice II",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": 13,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 1,
//           "subSubjects": 4,
//           "subjectIsElective": true,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": "Artificial Intelligence, Elective II  ",
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "AC-6",
//           "subjectName": "Audit Course 6",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "HN",
//           "subjectName": "Honor",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 6,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 4,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": true
//       }
//   
// };
// 5const subjectData = {
//     
//       {
//           "subjectInitial": "DBMS",
//           "subjectName": "Database Management Systems",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "TOC",
//           "subjectName": "Theory of Computation",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "SPOS",
//           "subjectName": "Systems Programming and Operating System",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "CNS",
//           "subjectName": "Computer Networks and Security",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "EL-1",
//           "subjectName": "Elective I- Internet of Things and Embedded Systems",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 4,
//           "subjectIsElective": true,
//           "subjectElectiveOptions": " Internet of Things and Embedded Systems,Human Computer Interface, Distributed Systems,Software Project Management",
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "DBMSL",
//           "subjectName": "Database Management Systems Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 12,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 1,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "CNL",
//           "subjectName": "Computer Networks and Security Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2020 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 17,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "LP-I",
//           "subjectName": "Laboratory Practice I",
//           "subjectYear": 2020,
//           "subjectPattern": "2021 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 9,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": " Systems Programming and Operating System ,Elective I (",
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "STC",
//           "subjectName": "Seminar and Technical Communication",
//           "subjectYear": 2020,
//           "subjectPattern": "2022 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "AC5",
//           "subjectName": "Audit Course 5",
//           "subjectYear": 2020,
//           "subjectPattern": "2023 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 5,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       }
//   
// };
// const subjectData = {
//     
//       {
//           "subjectInitial": "DM",
//           "subjectName": "Discrete Mathematics",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "FDS",
//           "subjectName": "Fundamentals of Data Structures",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "OOP",
//           "subjectName": "Object Oriented Programming (OOP)",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "CG",
//           "subjectName": "Computer Graphics",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": false,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "DELD",
//           "subjectName": "Digital Electronics and Logic Design",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 6,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "DSL",
//           "subjectName": "Data Structures Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 13,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "OOPCGL",
//           "subjectName": "OOP and Computer Graphics Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 14,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 1,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "DEL",
//           "subjectName": "Digital Electronics Laboratory",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 14,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "BCS",
//           "subjectName": "Business Communication Skills",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 15,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "HSS",
//           "subjectName": "Humanity and Social Science",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 16,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       },
//       {
//           "subjectInitial": "AC3",
//           "subjectName": "Audit Course 3",
//           "subjectYear": 2020,
//           "subjectPattern": "2019 Credit Pattern",
//           "subjectDepartment": "Computer",
//           "subjectSem": 3,
//           "subjectPracticalAssigments": 0,
//           "subjectTheoryAssignments": 0,
//           "subjectIsPractical": true,
//           "subjectMiniProjects": 0,
//           "subSubjects": 0,
//           "subjectIsElective": false,
//           "subjectElectiveOptions": null,
//           "subSubjectNames": null,
//           "subjectIsHonours": false
//       }
//   ]
// };



// addOrUpdateSubjects(subjectData);
// 

const deleteSubjects = async (subjectData) => {
  try {

    await Promise.all(subjectData.map(async (subject) => {
      const { subjectDepartment, subjectSem, subjectInitial } = subject;
      const subjectDocRef = firebase.firestore().collection(`Sinhgad/attendance/${subject.subjectYear}/${subject.subjectDepartment}/subject`).where("subjectInitial", "==", subject);

      const existingSubjectDoc = await subjectDocRef.get();

      if (existingSubjectDoc.exists) {
        // Subject exists, delete it
        console.log(`Deleting subject ${subjectInitial} for ${subjectDepartment}, Sem-${subjectSem}.`);

        await subjectDocRef.delete();
      } else {
        console.log(`Subject ${subjectInitial} for ${subjectDepartment}, Sem-${subjectSem} not found.`);
      }
    }));

    console.log('Subjects deleted successfully');
    return true
  } catch (error) {
    console.error('Error deleting subjects:', error);
    return false
  }
};


// Example usage
// const subjectsToDelete = [
//     {
//         subjectDepartment: 'Computer',
//         subjectSem: 8,
//         subjectInitial: 'HPC',
//     },
//     {
//         subjectDepartment: 'Computer',
//         subjectSem: 8,
//         subjectInitial: 'DL',
//     },
//     // Add more subjects as needed
// ];

// deleteSubjects(subjectsToDelete);

const generateRandomCode = (length) => {
  const characters = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
};

const firebaseMarkAttendance = async (id, subject, department, division, ay) => {
  const today = new Date();
  // Set hours, minutes, seconds, and milliseconds to 0
  today.setHours(0, 0, 0, 0);

  const userDocRef = db.collection(`Sinhgad/attendance/${ay}/${department}/attendance/`).doc(today.getTime().toString());
  try {
    const docSnapshot = await userDocRef.get();

    if (docSnapshot.exists) {
      // Collection already exists for today
      const existingData = docSnapshot.data() || {}; // Get existing data or initialize as empty object

      if (existingData[division]) {
        // Division exists
        if (existingData[division][subject]) {
          // Subject exists in the division
          if (!existingData[division][subject].includes(id)) {
            // Add ID to the subject's array
            existingData[division][subject].push(id);
          }
        } else {
          // Subject doesn't exist in the division, create new subject with ID
          existingData[division][subject] = [id];
        }
      } else {
        // Division doesn't exist, create new division with subject and ID
        existingData[division] = {
          [subject]: [id]
        };
      }

      // Update the document
      await userDocRef.set(existingData);
    } else {
      // Collection doesn't exist for today, create new collection
      const newData = {
        [division]: {
          [subject]: [id]
        }
      };

      // Create the document
      await userDocRef.set(newData);
    }

    return ('Attendance marked successfully.');
  } catch (error) {

    console.error('Error marking attendance:', error);
    return false
  }
};

const createCodeSet = async (deptWithoutRandom, durationInSeconds, updateIntervalInSeconds, res, subject) => {
  try {
    const numCodes = durationInSeconds / updateIntervalInSeconds
    const firestore = firebase.firestore();
    const department = deptWithoutRandom + generateRandomCode(2)
    const randomNumbersRef = firestore.collection(`Sinhgad/arrays/codes`).doc(department);

    // Create an array to store the codes and their expiry timestamps
    const codesArray = [];

    // Generate and set each code with its expiry timestamp
    for (let i = 0; i < numCodes; i++) {
      const docRefCode = generateRandomCode(10);
      const initialCode = generateRandomCode(5);

      // Calculate expiry timestamp for each code
      const expiresIn = firebase.firestore.Timestamp.fromMillis(
        Date.now() + (i * updateIntervalInSeconds + durationInSeconds) * 1000
      );

      // Set the code and expiry timestamp in the array
      codesArray.push({
        code: initialCode,
        expiresIn: expiresIn,
      });

      // Set initial document data
      console.log(`Code ${i + 1} generated: ${initialCode}, Expires in: ${expiresIn.toDate()}`);
    }
    await randomNumbersRef.set({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      codes: codesArray,
      subject: subject,
    });

    // Calculate the timestamp when the last code will expire
    const lastCodeExpiresIn = codesArray[codesArray.length - 1].expiresIn.toMillis();
    // Schedule deletion of the document after the last code expires
    res.status(200).json({ codesArray, department })
    setTimeout(async () => {
      await randomNumbersRef.delete();
      console.log('Document deleted after the last code expired.');
    }, lastCodeExpiresIn - Date.now());

  } catch (error) {
    console.error('Error creating code set:', error);
  }
};

// Get user input for department, number of codes, duration, and update interval

// Example usage with user input
// createCodeSet(department, durationInSeconds, updateIntervalInSeconds);
const codeListner = (callback) => {
  try {
    const firestore = firebase.firestore();

    // Start a snapshot listener on the "codes" collection group
    return firestore.collection('Sinhgad').doc('arrays').collection('codes').onSnapshot((querySnapshot) => {
      const commonCodesData = [];

      querySnapshot.forEach((doc) => {
        // Extract data from each document
        const data = doc.data();
        commonCodesData[doc.id] = (data);
      });

      callback(commonCodesData);
    });
  } catch (error) {
    console.error('Error starting common codes listener:', error);
    return null;
  }
};

// Example usage with collection group query and snapshot listener

// Start the snapshot listener for the collection group

// Stop the listener when it's no longer needed (e.g., when the component unmounts)
// unsubscribeCommonCodesListener();

// firebase.firestore.FieldValue.serverTimestamp()

const getAttendance = async (department, AY, date, subject) => {
  try {
    let response = {};
    console.log(department, AY, date, subject)
    // const userDocRef = db.collection(`Sinhgad/attendance/${AY}/${department}/attendance`).doc(date);
    const userDocRef = db.collection(`Sinhgad/attendance/${ay}/${department}/attendance/`).doc(date);

    const userDocSnapshot = await userDocRef.get();
    // console.log(userDocSnapshot)
    if (userDocSnapshot.exists) {
      response = { 'date': userDocSnapshot.id, ...userDocSnapshot.data() };
      // console.log(response);
      return response;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
  }
}

const firebaseUpdateExamStatus = async (studentId, subject, status, exam) => {
  const userRef = db.collection('Sinhgad/users/students').doc(studentId);
  const doc = await userRef.get();
  const userData = doc.data();
  const examData = (exam == "ut") ? "utData" : "prelimData";
  const examPassing = (exam == "ut") ? "utPassing" : "prelimPassing";
  const examMarks = (exam == "ut") ? "utMarks" : "prelimMarks";
  // Check if the user exists and has the specified subject
  if (userData && userData.grantProfile) {
    const semesterCourses = userData.grantProfile[userData.currentSem];

    if (semesterCourses && semesterCourses[subject]) {
      // Update the status of the specified assignment
      const assignmentsArray = semesterCourses[subject][examData] || [];
      console.log(assignmentsArray)
      if (assignmentsArray.isFailed) {
        if (status >= assignmentsArray[examPassing]) {
          assignmentsArray["isFailed"] = false; // Assuming assignment numbers are 1-based
          assignmentsArray[examMarks] = status; // Assuming assignment numbers are 1-based
          assignmentsArray["isReappeared"] = true; // Assuming assignment numbers are 1-based
        }
        else {
          assignmentsArray[examMarks] = status; // Assuming assignment numbers are 1-based
        }
      }
      else {
        if (status >= assignmentsArray[examPassing]) {
          assignmentsArray[examMarks] = status; // Assuming assignment numbers are 1-based
        }
        else {
          assignmentsArray[examMarks] = status; // Assuming assignment numbers are 1-based
          assignmentsArray["isFailed"] = true;
        }

      }
      console.log(assignmentsArray)
      await userRef.update({
        [`grantProfile.${userData.currentSem}.${subject}.${examData}`]: assignmentsArray
      });
    }
  }
}
const firebaseUpdateAssignmentStatus = async (studentId, subject, marks, assignmentNo) => {
  const userRef = db.collection('Sinhgad/users/students').doc(studentId);
  const doc = await userRef.get();
  const userData = doc.data();

  // Check if the user exists and has the specified subject
  if (userData && userData.grantProfile) {
    const semesterCourses = userData.grantProfile[userData.currentSem];

    if (semesterCourses && semesterCourses[subject]) {
      // Update the status of the specified assignment
      console.log(marks)
      const assignmentsArray = semesterCourses[subject].assignmentsArray || [];
      assignmentsArray[assignmentNo] = marks; // Assuming assignment numbers are 1-based
      console.log(assignmentsArray)

      // Update assignments status for the specified user, semester, and subject
      await userRef.update({
        [`grantProfile.${userData.currentSem}.${subject}.assignmentsArray`]: assignmentsArray
      });
    }
  }
}

const firebaseAddExtrasToGrantProfile = async (admissionYear, department, semester, extras) => {
  try {
    // Get references to the users collection
    const usersRef = firebase.firestore().collection('Sinhgad/users/students');
    // Query for all students with the specified department and admission year
    const querySnapshot = await usersRef
      .where('admissionYear', '==', admissionYear)
      .where('department', '==', department)
      .where('currentSem', '==', semester)
      .get();
    console.log(admissionYear, department, semester)

    // Iterate through each student document and update their grantProfile
    const updatePromises = [];
    querySnapshot.forEach(doc => {
      const studentRef = doc.ref;
      const grantProfile = doc.data().grantProfileExtras || {};
      const semesterData = grantProfile[semester] || {};
      const updatedSemesterData = { ...semesterData, ...extras };
      const updatedGrantProfile = { ...grantProfile, [semester]: updatedSemesterData };
      updatePromises.push(studentRef.update({ grantProfileExtras: updatedGrantProfile }));
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    return true; // Indicates successful update
  } catch (error) {
    console.error('Error adding extras to grantProfile:', error);
    return false; // Indicates failure
  }
}
const firebaseAddRemarksToGrantProfile = async (id, message, creatorData) => {
  try {
    // Get references to the users collection
    const remarks = {
      message: message,
      createdBy: creatorData.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }
    const usersRef = firebase.firestore().collection('Sinhgad/users/students');
    // Query for all students with the specified department and admission year
    const querySnapshot = await usersRef
      .where('id', '==', id)
      .get();

    // Iterate through each student document and update their grantProfile
    const updatePromises = [];
    querySnapshot.forEach(doc => {
      const studentRef = doc.ref;
      const grantProfile = doc.data().grantProfileExtras || {};
      const semesterData = grantProfile[doc.data().currentSem] || {};
      const updatedSemesterData = { ...semesterData, ...{ remarks } };
      const updatedGrantProfile = { ...grantProfile, [doc.data().currentSem]: updatedSemesterData };
      updatePromises.push(studentRef.update({ grantProfileExtras: updatedGrantProfile }));
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    return true; // Indicates successful update
  } catch (error) {
    console.error('Error adding extras to grantProfile:', error);
    return false; // Indicates failure
  }
}



// const department = 'Computer';
// const semester = 8;
const message = "Please allow him to sit for LP Practical ONLY"
const creatorData = {
  "name": "Geeta Navale"
}


async function firebaseGetSubjectwiseGrantProfile(admitYear, currentSemester, requiredSubject) {
  try {
    // Assuming the grant sheet documents are stored in a collection named "GrantSheets"
    const grantSheetSnapshot = await firebase.firestore().collection("Sinhgad/users/students").get();

    // Filter grant sheet documents based on admission year and current semester
    const filteredGrantSheets = await grantSheetSnapshot.docs.filter(doc => {
      const grantSheetData = doc.data();
      return grantSheetData.admissionYear == admitYear && grantSheetData.currentSem === currentSemester;
    });
    // Extract data for the required subject from the filtered grant sheets
    const subjectData = filteredGrantSheets.map(doc => {
      const grantSheetData = doc.data().grantProfile[currentSemester];
      const uid = doc.data().id;
      return ({ [uid]: grantSheetData[requiredSubject] })
    });
    console.log(subjectData)
    return subjectData;
  } catch (error) {
    console.error("Error filtering grant sheet data:", error);
    throw error;
  }
}



async function addPost(imageUrl, ownerId, ownerName, postText, type, facultyId) {
  try {
    // Convert the timestamp to a JavaScript Date object
    const currentDate = new Date();

    // Create a Firestore timestamp from the current Date object
    const firestoreTimestamp = firebase.firestore.Timestamp.fromDate(currentDate);

    const postData = {
      imageUrl: imageUrl,
      ownerId: ownerId,
      ownerName: ownerName,
      postText: postText,
      timestamp: firestoreTimestamp,
      isVerified: false,
      postType: type,
      facultyId: facultyId
    };

    // Add a new document to the 'Sinhgad/users/posts/' collection
    const docRef = await firebase.firestore().collection('Sinhgad/users/posts/').add(postData);
    console.log('Post added with ID: ', docRef.id);
    return true;
  } catch (error) {
    console.error('Error adding post: ', error);
    return false;
    // throw error;
  }
}

async function fetchPosts() {
  try {
    const snapshot = await firebase.firestore().collection('Sinhgad/users/posts/').get();
    const posts = [];
    snapshot.forEach((doc) => {
      const post = doc.data();
      // Include the document ID along with the post data
      posts.push({ postId: doc.id, ...post });
    });
    console.log(posts)
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}



async function firebaseVerifyPost(postId, credPoints, userData) {
  try {
    const postData = {
      isVerified: true,
      credPoints: credPoints,
      verifiedBy: userData.name
    };

    // Update the document in the 'Sinhgad/users/posts/' collection with the provided postId
    await firebase.firestore().collection('Sinhgad/users/posts/').doc(postId).update(postData);
    if (credPoints > 0) {
      await credTransanction('profit', credPoints, `Posted Certificate Verified By:${userData.name}[${userData.id}]`, userData.id)
    }
    console.log('Post verified successfully.');
    return true;
  } catch (error) {
    console.error('Error verifying post: ', error);
    return false;
    // throw error;
  }
}

async function fetchPostsByOwnerId(ownerId) {
  try {
    const snapshot = await firebase.firestore().collection('Sinhgad/users/posts/').where('ownerId', '==', ownerId).get();
    const posts = [];
    snapshot.forEach((doc) => {
      const postData = doc.data();
      // Include the document ID along with the post data
      posts.push({ id: doc.id, ...postData });
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts by owner ID:', error);
    return false;
    //   throw error;
  }
}

async function getStaffDetails(department) {
  try {
    const snapshot = await firebase.firestore().collection('Sinhgad/users/moderators/').where('department', '==', department).get();
    const posts = [];
    snapshot.forEach((doc) => {
      const postData = doc.data();
      // Include the document ID along with the post data
      posts.push({ id: doc.id, ...postData });
    });
    console.log(posts)
    return posts;
  } catch (error) {
    console.error('Error fetching posts by owner ID:', error);
    return false;
    //   throw error;
  }
}

// async function updatesubjectAllocation(id,data){
//   try{
//     const snapshot = await firebase.firestore().collection('Sinhgad/users/moderators/').doc(id);
//     await snapshot.update({
//       [`subjectsAllocated.${userData.currentSem}.${subject}.assignmentsArray`]: assignmentsArray
//     });
//       console.log(snapshot)
//       return postData;
//     } catch (error) {
//       console.error('Error fetching posts by owner ID:', error);
//       return false;
//       //   throw error;
//     }
// }

async function updateTeacherProfile(id, updatedProfile) {
  try {
    const teacherRef = firebase.firestore().collection('Sinhgad/users/moderators/').doc(id);

    // Update the teacher profile document
    await teacherRef.update(updatedProfile);

    console.log('Teacher profile updated successfully.');
    return true;
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    return false;
  }
}

// Function to add a subject to the subjectsAllocated map for a teacher
async function addSubjectToTeacher(teacherId, subjectCode, division, semester, subjectYear) {
  try {
    const teacherRef = db.collection('Sinhgad/users/moderators').doc(teacherId);

    // Update the subjectsAllocated map with the new subject
    await teacherRef.update({
      [`subjectsAllocated.${subjectCode}`]: { division, semester, subjectYear }
    });

    console.log(`Subject ${subjectCode} added to teacher ${teacherId}.`);
  } catch (error) {
    console.error("Error adding subject to teacher:", error);
  }
}
async function deleteSubjectFromTeacher(teacherId, subjectCode) {
  try {
    const teacherRef = db.collection('Sinhgad/users/moderators').doc(teacherId);

    // Remove the subject from the subjectsAllocated map
    await teacherRef.update({
      [`subjectsAllocated.${subjectCode}`]: firebase.firestore.FieldValue.delete()
    });

    console.log(`Subject ${subjectCode} deleted from teacher ${teacherId}.`);
  } catch (error) {
    console.error("Error deleting subject from teacher:", error);
  }
}

async function deleteUserProfile(email) {
  try {
    // Delete the user from Firebase Authentication
    const teacherRef = firebase.firestore().collection('teachers').doc(id);
    await teacherRef.delete();
    await firebase.auth().getUserByEmail(email)
      .then(async (userRecord) => {
        await firebase.auth().deleteUser(userRecord.uid);
      });
    console.log('User profile deleted successfully.');
    return true;
  } catch (error) {
    console.error('Error deleting user profile and sending email:', error);
    return false;
  }
}

// async function getSubjectInfo(department, division, subjectYear, semester, subject) {
//   try {
//     const snapshot = await firebase.firestore().collection('Sinhgad/users/students').where("admissionYear", '==', subjectYear).where('department', '==', department).where('division', '==', division).where('currentSem', '==', semester).get();
//     const posts = [];
//     snapshot.forEach((doc) => {
//       const postData = doc.data();
//       // Include the document ID along with the post data
//       posts.push({ id: doc.id, ...postData.grantProfile[semester][subject] });
//     });
//     console.log(posts)
//     return posts;
//   } catch (error) {
//     console.error('Error fetching posts by owner ID:', error);
//     return false;
//     //   throw error;
//   }
// }
// getSubjectInfo("Computer","A",2020,7,'DAA')
// async function getSubjectInfo(department, division, subjectYear, semester, subject) {
//   try {
//     const snapshot = await firebase.firestore().collection('Sinhgad/users/students')
//       .where("admissionYear", '==', subjectYear)
//       .where('department', '==', department)
//       .where('division', '==', division)
//       .where('currentSem', '==', semester)
//       .get();

//     const totalStudents = snapshot.size;
//     let totalAssignmentsCompleted = 0;
//     let totalAssignmentsTotal = 0;
//     let totalUTAppeared = 0;
//     let totalUTFailed = 0;
//     let totalUTReappeared = 0;
//     const electiveChoices = {};

//     snapshot.forEach((doc) => {
//       const grantProfile = doc.data().grantProfile;
//       if (grantProfile && grantProfile[semester] && grantProfile[semester][subject]) {
//         const subjectData = grantProfile[semester][subject];
//         if (subjectData) {
//           // Calculate total assignments completed
//           totalAssignmentsCompleted += subjectData.assignmentsArray.filter(assignment => assignment === 1).length;

//           // Calculate total assignments total
//           totalAssignmentsTotal += subjectData.assignmentsArray.length;

//           // Calculate total UT appeared
//           totalUTAppeared += subjectData.utData.isReappeared ? 1 : 0;

//           // Calculate total UT failed
//           totalUTFailed += subjectData.utData.isFailed ? 1 : 0;

//           // Calculate total UT reappeared
//           totalUTReappeared += subjectData.utData.isReappeared ? 1 : 0;

//           // If subject is elective, record elective choices
//           if (subjectData.subjectIsElective && subjectData.subjectIsElective.selectedSubject) {
//             const selectedSubject = subjectData.subjectIsElective.selectedSubject;
//             electiveChoices[selectedSubject] = electiveChoices[selectedSubject] ? electiveChoices[selectedSubject] + 1 : 1;
//           }
//         }
//       }
//     });
//     console.log({
//       totalStudents,
//       totalAssignmentsCompleted,
//       totalAssignmentsTotal,
//       totalUTAppeared,
//       totalUTFailed,
//       totalUTReappeared,
//       electiveChoices
//     })
//     return {
//       totalStudents,
//       totalAssignmentsCompleted,
//       totalAssignmentsTotal,
//       totalUTAppeared,
//       totalUTFailed,
//       totalUTReappeared,
//       electiveChoices
//     };
//   } catch (error) {
//     console.error('Error fetching subject info:', error);
//     return null;
//   }
// }


async function findTeacherForSubject(subjectName, division, year) {
  try {
    const snapshot = await firebase.firestore().collection('Sinhgad/users/moderators')
      .where(`subjectsAllocated.${subjectName}.division`, '==', division)
      .where(`subjectsAllocated.${subjectName}.subjectYear`, '==', year)
      .get();

    const teachers = [];
    snapshot.forEach((doc) => {
      const teacherData = doc.data();
      teachers.push({ id: doc.id, ...teacherData });
    });
    console.log(teachers)
    return teachers;
  } catch (error) {
    console.error('Error finding teacher for subject:', error);
    return null;
  }
}

async function getSubjectStats(department, division, subjectYear, semester, subject) {
  try {
    const snapshot = await firebase.firestore().collection('Sinhgad/users/students')
      .where("admissionYear", '==', subjectYear)
      .where('department', '==', department)
      .where('division', '==', division)
      .where('currentSem', '==', semester)
      .get();
    const teacherData = await findTeacherForSubject(subject, division, subjectYear)
    const totalStudents = snapshot.size;
    let totalAssignmentsTotal = 0;
    let totalUTAppeared = 0;
    let totalUTFailed = 0;
    let totalUTReappeared = 0;
    let totalPrelimAppeared = 0;
    let totalPrelimFailed = 0;
    let totalPrelimReappeared = 0;
    const electiveChoices = {};
    let availableElective = {};
    const assignmentsCompletedCount = {}; // Track assignments completion count

    snapshot.forEach((doc) => {
      const grantProfile = doc.data().grantProfile;
      if (grantProfile && grantProfile[semester] && grantProfile[semester][subject]) {
        const subjectData = grantProfile[semester][subject];
        if (subjectData) {
          // Calculate total assignments completed
          const assignmentsCompleted = subjectData.assignmentsArray.filter(assignment => assignment > 0).length;

          // Calculate total assignments total
          totalAssignmentsTotal = subjectData.assignmentsArray.length;

          // Calculate total UT appeared
          totalUTAppeared += subjectData.utData.utMarks > 0 ? 1 : 0;

          // Calculate total UT failed
          totalUTFailed += subjectData.utData.isFailed ? 1 : 0;

          // Calculate total UT reappeared
          totalUTReappeared += subjectData.utData.isReappeared ? 1 : 0;

          totalPrelimAppeared += subjectData.prelimData.utMarks > 0 ? 1 : 0;

          // Calculate total UT failed
          totalPrelimFailed += subjectData.prelimData.isFailed ? 1 : 0;

          // Calculate total UT reappeared
          totalPrelimReappeared += subjectData.prelimData.isReappeared ? 1 : 0;
          // If subject is elective, record elective choices
          if (subjectData.subjectIsElective && subjectData.subjectIsElective.selectedSubject) {
            const selectedSubject = subjectData.subjectIsElective.selectedSubject;
            availableElective = subjectData.subjectIsElective.subjectElectiveChoices;
            electiveChoices[selectedSubject] = electiveChoices[selectedSubject] ? electiveChoices[selectedSubject] + 1 : 1;
          }

          // Track assignments completion count
          assignmentsCompletedCount[assignmentsCompleted] = assignmentsCompletedCount[assignmentsCompleted] ? assignmentsCompletedCount[assignmentsCompleted] + 1 : 1;
        }
      }
    });
    console.log({
      teacherData,
      totalStudents,
      totalAssignmentsTotal,
      totalUTAppeared,
      totalUTFailed,
      totalUTReappeared,
      totalPrelimAppeared,
      totalPrelimFailed,
      totalPrelimReappeared,
      availableElective,
      electiveChoices,
      assignmentsCompletedCount
    })
    return {
      teacherData,
      totalStudents,
      totalAssignmentsTotal,
      totalUTAppeared,
      totalUTFailed,
      totalUTReappeared,
      totalPrelimAppeared,
      totalPrelimFailed,
      totalPrelimReappeared,
      availableElective,
      electiveChoices,
      assignmentsCompletedCount
    };
  } catch (error) {
    console.error('Error fetching subject info:', error);
    return null;
  }
}
// getSubjectStats("Computer","A",2020,8,'EL5')


const getAllSubjects = async (department, year) => {
  const finalDoc = [];
  console.log(department, year)
  for (let i = 1; i <= 8; i++) {
    const collectionRef = firebase.firestore().collection(`Sinhgad/attendance/${year}/${department}/subjects/`);
    const querySnapshot = await collectionRef.where('semester', '==', i).get();
    // const querySnapshot = await collectionRef.get();

    const subjectDoc = [];

    await querySnapshot.forEach((doc) => {
      const data = doc.data();
      const assignmentsArray = data.subjectIsPractical ? data.subjectPracticalAssignments : data.subjectTheoryAssignments;

      const subjectInfo = {
        subjectMiniProjects: data.subjectMiniProjects > 0 ? Array(data.subjectMiniProjects).fill(0) : null,
        subjectIsElective: data.subjectIsElective ? { selectedSubject: "", subjectElectiveChoices: data.subjectElectiveChoices } : null,
        assignmentsArray: assignmentsArray,
        utData: {
          utMarks: 0,
          utTotal: data.utTotal || 0,
          utPassing: data.utPassing || 0,
          isFailed: data.isFailed || false,
          isReappeared: data.isReappeared || false,
        },
        prelimData: {
          prelimMarks: 0,
          prelimTotal: data.prelimTotal || 0,
          prelimPassing: data.prelimPassing || 0,
          isFailed: data.isFailed || false,
          isReappeared: data.isReappeared || false,
        }
      };

      subjectDoc.push(data.subjectInitial);
    });

    finalDoc.push(subjectDoc);
  }
  console.log(finalDoc)
  return finalDoc;
};

// getAllSubjects("Computer",2020)
// const { google } = require('googleapis');
// const sheets = google.sheets('v4');


async function credTransanction(type, amount, task, uid) {
  const timestamp = firebase.firestore.Timestamp.now();
  const transaction = {
    amount: amount,
    task: task,
    date: timestamp
  };

  const profileRef = await firebase.firestore().collection('Sinhgad/users/students').doc(uid)
  const profileDoc = await profileRef.get();
  const currentBalance = profileDoc.data().credPoints.balance;
  console.log(currentBalance)
  let newBalance = currentBalance;
  // Get the current credPoints balance

  switch (type) {
    case "redeem":
      if (currentBalance > transaction.amount) {
        newBalance = currentBalance - transaction.amount;
        // const newTransaction = { ...transaction, date: timestamp };
        await profileRef.update({
          'credPoints.balance': newBalance,
          'credPoints.redeemHistory': firebase.firestore.FieldValue.arrayUnion(transaction)
        });
      }
      else {
        throw ("Insufficient Balance")
      }
      break
    case "profit":
      newBalance = currentBalance + transaction.amount;
      await profileRef.update({
        'credPoints.balance': newBalance,
        'credPoints.profitHistory': firebase.firestore.FieldValue.arrayUnion(transaction)
      });
      break;
    default:
      throw ("Invalid Transanction")
  }

}

async function getDivisionAttendanceStats(year, department) {
  try {
    const attendanceRef = firebase.firestore().collection(`Sinhgad/attendance/${year}/${department}/attendance`);
    const attendanceSnapshots = await attendanceRef.get();

    const divisionStats = {};

    attendanceSnapshots.forEach(attendanceSnapshot => {
      const timestamp = attendanceSnapshot.id;
      const attendanceData = attendanceSnapshot.data();

      for (const division in attendanceData) {
        if (attendanceData.hasOwnProperty(division)) {
          if (!divisionStats[division]) {
            divisionStats[division] = {};
          }

          const subjects = attendanceData[division];
          for (const subject in subjects) {
            if (subjects.hasOwnProperty(subject)) {
              if (!divisionStats[division][subject]) {
                divisionStats[division][subject] = {
                  totalLecturesConducted: 0,
                  dates: {}
                };
              }

              divisionStats[division][subject].totalLecturesConducted += 1;
              divisionStats[division][subject].dates[timestamp] = subjects[subject].length;
            }
          }
        }
      }
    });

    // Calculate average attendance
    for (const division in divisionStats) {
      for (const subject in divisionStats[division]) {
        const totalLecturesConducted = divisionStats[division][subject].totalLecturesConducted;
        const totalDates = Object.keys(divisionStats[division][subject].dates).length;
        divisionStats[division][subject].averageAttendance = totalDates > 0 ? totalLecturesConducted / totalDates : 0;
      }
    }
    return divisionStats;
  } catch (error) {
    console.error('Error fetching division-wise attendance stats:', error);
    return null;
  }
}

async function getStudentAttendanceStats(year, department, studentId) {
  try {
    const attendanceRef = firebase.firestore().collection(`Sinhgad/attendance/${year}/${department}/attendance`);
    const attendanceSnapshots = await attendanceRef.get();

    const studentStats = {};

    attendanceSnapshots.forEach(attendanceSnapshot => {
      const timestamp = attendanceSnapshot.id;
      const attendanceData = attendanceSnapshot.data();

      for (const division in attendanceData) {
        if (attendanceData.hasOwnProperty(division)) {
          const subjects = attendanceData[division];
          for (const subject in subjects) {
            if (subjects.hasOwnProperty(subject)) {
              if (!studentStats[subject]) {
                studentStats[subject] = {
                  totalConducted: 0,
                  totalPresent: 0
                };
              }

              studentStats[subject].totalConducted += 1;
              if (subjects[subject].includes(studentId)) {
                studentStats[subject].totalPresent += 1;
              }
            }
          }
        }
      }
    });

    // Calculate percentage attendance for each subject
    for (const subject in studentStats) {
      const totalConducted = studentStats[subject].totalConducted;
      const totalPresent = studentStats[subject].totalPresent;
      studentStats[subject].percentageAttendance = totalConducted > 0 ? (totalPresent / totalConducted) * 100 : 0;
      studentStats[subject].defaulter = studentStats[subject].percentageAttendance < 75;
    }

    // Calculate overall percentage attendance for all subjects
    const totalSubjects = Object.keys(studentStats).length;
    const totalConductedAllSubjects = Object.values(studentStats).reduce((total, subject) => total + subject.totalConducted, 0);
    const totalPresentAllSubjects = Object.values(studentStats).reduce((total, subject) => total + subject.totalPresent, 0);
    const percentageAttendanceAllSubjects = totalConductedAllSubjects > 0 ? (totalPresentAllSubjects / totalConductedAllSubjects) * 100 : 0;
    console.log(studentStats)
    return { studentStats, percentageAttendanceAllSubjects };
  } catch (error) {
    console.error('Error fetching student-wise attendance stats:', error);
    return null;
  }
}

async function makeSheetPublic(sheetId) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: authData,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    // Set the sheet's permission to public
    await drive.permissions.create({
      resource: {
        role: 'reader',
        type: 'anyone'
      },
      fileId: sheetId,
      fields: 'id'
    });

    return `https://docs.google.com/spreadsheets/d/${sheetId}`;
  } catch (error) {
    console.error('Error making sheet public:', error);
    return null;
  }
}


async function exportAttendanceToGoogleSheet(year, department, division, subject) {
  try {
    // Get attendance data from Firestore
    const attendanceSnapshot = await firebase.firestore()
      .collection(`Sinhgad/attendance/${year}/${department}/attendance`)
      .get();
    // console.log(division,department,year)



    // Get student data from Firestore
    const studentSnapshot = await firebase.firestore()
      .collection('Sinhgad/users/students')
      .where('admissionYear', '==', year)
      .where('department', '==', department)
      .where('division', '==', division)
      .get();

    // Create a new Google Sheet
    // const auth = new google.auth.GoogleAuth({
    //   credentials:  authData,
    //   scopes: ['https://www.googleapis.com/auth/spreadsheets']
    // });
    // const authClient = await auth.getClient();
    // const sheets = google.sheets({ version: 'v4', auth: authClient });
    // const spreadsheet = await sheets.spreadsheets.create({
    //   resource: {
    //     properties: {
    //       title: `${department}_${division}_${subject}_Attendance`
    //     }
    //   }
    // });

    // const sheetId = spreadsheet.data.spreadsheetId;
    // makeSheetPublic(sheetId)
    // Populate student names and IDs 
    const studentsData = [];
    studentSnapshot.forEach(doc => {
      const student = doc.data();
      console.log(student)
      studentsData.push([student.name, doc.id]);
    });

    // Populate dates from attendance data
    const dates = [];
    attendanceSnapshot.forEach(doc => {
      const date = new Date(parseInt(doc.id));
      dates.push(date.toISOString().split('T')[0]);
    });

    // Create header row
    const headers = ['Name', 'Student ID', ...dates];

    // Create data array
    const data = [headers, ...studentsData.map(student => [student[0], student[1], ...Array(dates.length).fill(0)])];
    console.log(studentsData)
    // Update Google Sheet with data
    // await sheets.spreadsheets.values.update({
    //   spreadsheetId: sheetId,
    //   range: 'A1',
    //   valueInputOption: 'RAW',
    //   resource: { values: data }
    // });

    return `https://docs.google.com/spreadsheets/d/${sheetId}`;
  } catch (error) {
    console.error('Error exporting attendance to Google Sheet:', error);
    return null;
  }
}

async function exportAttendanceToGoogleSheet(year, department, division, subject) {
  try {
    // Get attendance data from Firestore
    const attendanceRef = firebase.firestore().collection(`Sinhgad/attendance/${year}/${department}/attendance`);
    const attendanceSnapshot = await attendanceRef.get();

    // Get student data from Firestore
    const studentSnapshot = await firebase.firestore()
      .collection('Sinhgad/users/students')
      .where('admissionYear', '==', year)
      .where('department', '==', department)
      .where('division', '==', division)
      .get();

    // Get student names and IDs
    const studentsData = [];
    studentSnapshot.forEach(doc => {
      const student = doc.data();
      studentsData.push([student.name, doc.id]);
    });

    // Create header row with dates
    const headers = ['Name', 'Student ID'];
    const dates = attendanceSnapshot.docs.map(doc => new Date(parseInt(doc.id)).toISOString().split('T')[0]);
    headers.push(...dates);

    // Create data array
    const data = [headers];
    let dats = attendanceSnapshot.docs.map(doc => doc.id)
    studentsData.forEach(student => {
      const rowData = [student[1], student[0]];
      // Populate attendance for each student
      dats.forEach(dat => {
        const attendanceData = attendanceSnapshot.docs.find(doc => doc.id == dat)?.data();
        console.log(attendanceData)
        const attendance = attendanceData?.[division]?.[subject] || [];
        const present = attendance.includes(student[1]) ? 1 : 0; // 1 for present, 0 for absent
        rowData.push(present);
      });
      data.push(rowData);
      // console.log(data)
    });

    // Create the Google Sheet
    const auth = new google.auth.GoogleAuth({
      credentials: authData,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    // const spreadsheet = await sheets.spreadsheets.create({
    //   resource: {
    //     properties: {
    //       title: `${department}_${division}_${subject}_Attendance`
    //     }
    //   }
    // });

    const sheetId = "1r-Ii0L3GM9tN_jfkOtV22kzLz-pvIfQgpMXrCQRJVrE";
    console.log(data)
    // Update the Google Sheet with attendance data
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'A1', // Start from A1 cell
      valueInputOption: 'RAW',
      resource: { values: data }
    });

    // Make the sheet public
    await makeSheetPublic(sheetId);

    return `https://docs.google.com/spreadsheets/d/${sheetId}`;
  } catch (error) {
    console.error('Error exporting attendance to Google Sheet:', error);
    return null;
  }
}



async function viewSheets() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: authData,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    // List all files in Google Drive
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)'
    });

    const sheetsList = res.data.files.map(file => ({ id: file.id, name: file.name }));
    return sheetsList;
  } catch (error) {
    console.error('Error viewing sheets:', error);
    return null;
  }
}

// Function to delete a Google Sheet by ID
async function deleteSheet(sheetId) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: authData,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    // Delete the sheet
    await drive.files.delete({ fileId: sheetId });

    console.log(`Sheet with ID ${sheetId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Error deleting sheet with ID ${sheetId}:`, error);
    return false;
  }
}

// viewSheets()
//   .then(sheetsList => {
//     console.log('Sheets:', sheetsList);
//     // Choose a sheet to delete by ID
//     // const sheetToDeleteId = 'your_sheet_id_here';
//     deleteSheet("1mvejGK96fAtq_aKPYaTPJQuH2fJKk9P8hk_rZzpjLiI");
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

// Usage example
// const year = 2020;
// // const department = 'Computer';
// const division = 'A';
// const subject = 'DAA';
// exportAttendanceToGoogleSheet(year, department, division, subject)
//   .then(sheetUrl => {
//     console.log('Attendance data exported to Google Sheet:', sheetUrl);
//   })
//   .catch(error => {
//     console.error('Failed to export attendance to Google Sheet:', error);
//   });


async function firebaseElectiveActivate(semester, subject) { }
async function firebaseElectiveDeactivate(semester, subject) { }
async function firebaseElectiveAllocate(semester, subject, uidlist) { }
async function firebaseElectiveDislocate(semester, subject, uidlist) { }
module.exports = {
  getStudentAttendanceStats,
  fetchPosts, addPost, firebaseVerifyPost, fetchPostsByOwnerId,
  addOrUpdateSubjects, deleteSubjects,
  importUserWithoutPassword, getAttendance, firebaseMarkAttendance,
  firebaseTokenLogin, searchDocuments, searchStudents,
  getAllDocuments, extractUidFromBearerToken, fetchUserProfile,
  createCodeSet, codeListner, resetEmailPassword, serverUserType,
  decodeBase64WithKey, firebaseUpdateAssignmentStatus, getAttendanceByStudent,
  getAttendanceBySubject, getAttendanceByDivision,
  firebaseGetSubjectwiseGrantProfile, updateUserProfile, firebaseUpdateExamStatus,
  getStaffDetails, updateTeacherProfile, deleteUserProfile, credTransanction,
  updateSemesterByAdmissionYear, updateSemesterByDepartment,
  addSubjectToTeacher, deleteSubjectFromTeacher, getAllSubjects, getSubjectStats,
  firebaseAddExtrasToGrantProfile, firebaseAddRemarksToGrantProfile,
  firebaseElectiveActivate,
  firebaseElectiveDeactivate,
  firebaseElectiveAllocate,
  firebaseElectiveDislocate, getStatCounts
};