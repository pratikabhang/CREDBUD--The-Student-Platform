const { codeListner, createCodeSet, fetchUserProfile, firebaseMarkAttendance, getAttendanceByStudent, getAttendanceBySubject, getAttendanceByDivision, getStudentAttendanceStats } = require('../utils/firebase');

let newCode;

const handleCodesChange = (commonCodesData) => {
    if (commonCodesData) {
        newCode = commonCodesData;
        console.log('Common codes updated:', newCode);
        // Update your frontend state or perform actions based on the updated common codes
    } else {
        console.log('No common codes found.');
    }
};
let snapshot = codeListner(handleCodesChange);
const markAttendance = async (req, res) => {
    // /Sinhgad/attendance/2020/Computer/attendance/1710441000 {DAA["A":{},'B':{}]}
    const { qrId, code, subject } = req.body;
    const { uid, userData } = req;
    console.log(userData);
    let codes = Object.values(newCode[qrId].codes);
    const currentTime = new Date().getTime() / 1000;

    let codeFound = false;
    console.log(newCode[qrId])
    if (true) {
        for (const element of codes) {
            if (element.code === code) {

                if (currentTime >= newCode[qrId].createdAt.seconds &&
                    currentTime <= element.expiresIn.seconds) {
                    const attendace = await firebaseMarkAttendance(uid, subject, userData.department, userData.division, userData.admissionYear)
                    if (attendace) { 
                        console.log('Marking attendance with qrId:', qrId, 'uid:', uid, 'code:', code);
                        console.log(userData);
                        res.status(200).json({ message: 'Marking attendance with qrId:' + qrId + ' uid:' + uid + ' code:' + code });
                    }
                    codeFound = true;
                    break; // Exit the loop once attendance is marked
                } else {
                    // Code has expired
                    console.log('Code has expired:', code);
                    res.status(401).json({ message: 'Code is INVALID.' });
                    codeFound = true;
                    break; // Exit the loop if code is expired
                }
            }
        }

        if (!codeFound) {
            // Code not found in the loop
            res.status(404).json({ message: 'Code not found.' });
        }
    }
    else {
        // Code not found in the loop
        res.status(404).json({ message: 'Subject or Division Mismatch' });
    }
};

const createCodes = async (req, res) => {
    // if (req.serverUserType!="administrators"){
    //     res.status(401).json({ message:"Unauthorized"});
    // };
    const { department, duration, interval, subject } = req.body;
    // console.log(department,duration,interval)
    await createCodeSet(department, duration, interval, res, subject);
}

const stats=async(req,res)=>{
    const {userData}=req
    try{
        getStudentAttendanceStats(userData.admissionYear,userData.department,userData.id).then((data)=>{
            if (data) {
                res.status(200).json( data )
            }
            else {
                res.status(400).json({ message: "No data Found" })
                
            }})
        }catch(e){
            res.status(400).json({ message: "No data Found" })
    }
    
}

const fetchAttendance = async (req, res) => {
    // let { uid, userData, serverUserType} = req;
    let { userData, serverUserType} = req;
    let isPrevilaged=false;
    if (serverUserType==="administrators" || serverUserType==="moderators" ){
        isPrevilaged=true   
    }
    console.log(serverUserType)
    const uid = isPrevilaged? req.body.id : userData.id;
    const department = isPrevilaged? req.body.department : userData.department;
    const division =isPrevilaged? req.body.division : userData.division;
    const subject = isPrevilaged? req.body.subject : userData.subject;
    const admissionYear = isPrevilaged? req.body.admissionYear : userData.admissionYear;
    // const sem = isPrevilaged? req.body.currentSem : userData.currentSem;

        // let {searchType} = req.body;
        let searchType =isPrevilaged? req.body.searchType:"student";
        // console.log(searchType)
        
        switch (searchType) {
            case "subject" && (serverUserType==="administrators" || serverUserType==="moderators"):     
                await getAttendanceBySubject(subject,department,division,admissionYear).then((data)=>{
                    if (data) {
                        res.status(200).json({ data })
                    }
                    else {
                        res.status(400).json({ message: "No data Found" })
                
                    }
                })
                break;
            case "student":
                await getAttendanceByStudent(uid,department,division,admissionYear).then((data)=>{
                    if (data) {
                        res.status(200).json({ data })
                    }
                    else {
                        res.status(400).json({ message: "No data Found" })
                
                    }
                
                })
                break;
                case "division":
                    await getAttendanceByDivision(department,division,admissionYear).then((data)=>{
                        if (data) {
                            res.status(200).json({ data })
                        }
                        else {
                            res.status(400).json({ message: "No data Found" })
                    
                        }
                    
                    })
                    break;

            default:
                res.status(401).json({ message: "Functionality not available for this previlage" })
                break;
        }
        
    
}

const vipAttendance = async (req, res) => {
    const { department, subject, studentUid,division,admitYear } = req.body;
    // console.log(typeof(studentUid))
    let arraypushed=0;
    await studentUid.forEach( async (id) => {
        const attendace = await firebaseMarkAttendance(id, subject,department, division, admitYear)
        if (attendace) {
            // console.log();
            console.log(attendace);
            res.status(200).json({ message: 'Marking attendance for uid:', uid});
            arraypushed++;
        }
        console.log(arraypushed)
    });
   
    res.status(200).json({ message: `Marking attendace for ${department},${subject},Total ${arraypushed}` })

}
module.exports = {stats, markAttendance, createCodes, vipAttendance, fetchAttendance };