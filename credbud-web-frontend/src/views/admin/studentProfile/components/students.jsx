
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton, SkeletonText, Avatar, Box, Grid, Button, Heading, Stack, StackDivider, Text, UnorderedList, ListItem,
    useDisclosure, Table, Tbody, Td, Th, Thead, Tr,
    useColorModeValue,
    Input,
    Flex,
    Progress
  } from "@chakra-ui/react";
  
  // Custom components

  import Banner from "views/admin/profile/components/Banner";
  // Assets
  import banner from "assets/img/auth/banner.png";
  import React, { useEffect, useState } from "react";
  import { useUserAuth } from "contexts/UserAuthContext";
  import { useParams } from "react-router-dom/cjs/react-router-dom.min";
  import { searchUser } from "api/apiService";
  import Card from "components/card/Card";
  import { getUserAttendance } from "api/apiService";
  import { updateRemarks } from "api/apiService";
  export default function Overview() {
  
    const [modalProp, setModalProp] = useState({})
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [data, setData] = useState([])
    const { searchedProfile } = useUserAuth()
    const [viewModal, setViewModal] = useState(false)
    const [attendanceData, setAttendanceData] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const { id, userType } = useParams();
    let mainText = useColorModeValue('navy.700', 'white');
    let secondaryText = useColorModeValue('gray.700', 'white');
    // console.log(searchedProfile)
  
    const [remarks, setRemarks] = useState(null)
  
    const handleRemarks = async () => {
      setIsUploading(true)
      let remarkData = {
        "message": remarks,
        "id": data.id
      }
      if (!data.grantProfileExtras[data.currentSem].remarks) {
        data.grantProfileExtras[data.currentSem].remarks = {};
      }
      data.grantProfileExtras[data.currentSem].remarks.message = remarks;
      data.grantProfileExtras[data.currentSem]["remarks"]["message"] = remarks
      const call = await updateRemarks(remarkData)
      if (call.message) {
  
      }
      setIsUploading(false)
    }
    useEffect(() => {
      async function fetchData() {
        try {
          if (!searchedProfile) {
            const userData = await searchUser(id, "id", userType);
            setData(userData[0].data);
          } else {
            setData(searchedProfile.data);
          }
          setIsLoaded(true);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setIsLoaded(true);
        }
      }
  
      fetchData();
      console.log(data.data)
    }, [id, userType, searchedProfile]);
    const [quickViewEnabled, setQuickViewEnabled] = useState(false);
    const [isUploading, setIsUploading] = useState(false)
    const toggleQuickView = () => {
      setQuickViewEnabled(!quickViewEnabled);
    };
    function getSemesterAbbreviation(currentSemester) {
      let abbreviation;
      switch ((currentSemester)) {
        case 1:
            abbreviation = "FE"; // First Year Engineering
            break;
        case 2:
          abbreviation = "FE"; // First Year Engineering
          break;
        case 3:
            abbreviation = "SE"; // Second Year Engineering
            break;
        case 4:
          abbreviation = "SE"; // Second Year Engineering
          break;
        case 5:
            abbreviation = "TE"; // Third Year Engineering
            break;
        case 6:
          abbreviation = "TE"; // Third Year Engineering
          break;
        case 7:
          abbreviation = "BE"; // Third Year Engineering
          break;
        case 8:
          abbreviation = "BE"; // Third Year Engineering
          break;
        default:
          abbreviation = "NA"; // Bachelor of Engineering
      }
      return (abbreviation);
    }
    if (!isLoaded || !data) {
      return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
          <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
        </Box>
      );
    }
    const summary = {
      zeroAssignments: 0,
      failedUT: 0,
      failedPrelim: 0,
      reappearedUT: 0,
      reappearedPrelim: 0,
      totalSubjects: Object.keys(data.grantProfile[data.currentSem]).length,
      totalAssignments: 0,
      totalSubmissions: 0
    };
  
    Object.keys(data.grantProfile[data.currentSem]).forEach((subject) => {
      const subjectData = data.grantProfile[data.currentSem][subject];
      const isZeroAssignments = subjectData.assignmentsArray.every(assignment => assignment === 0);
      const failedUT = subjectData.utData && subjectData.utData.isFailed;
      const failedPrelim = subjectData.prelimData && subjectData.prelimData.isFailed;
      const reappearedUT = subjectData.utData && subjectData.utData.isReappeared;
      const reappearedPrelim = subjectData.prelimData && subjectData.prelimData.isReappeared;
  
      summary.totalAssignments += subjectData.assignmentsArray.length;
      summary.totalSubmissions += subjectData.assignmentsArray.filter(assignment => assignment !== 0).length;
  
      if (isZeroAssignments) summary.zeroAssignments++;
      if (failedUT) summary.failedUT++;
      if (failedPrelim) summary.failedPrelim++;
      if (reappearedUT) summary.reappearedUT++;
      if (reappearedPrelim) summary.reappearedPrelim++;
    });
    const calculateSummary = (grantProfile) => {
      const summary = {};
  
      Object.keys(grantProfile).forEach((subject) => {
        const assignments = grantProfile[subject].assignmentsArray;
        const totalAssignments = assignments ? assignments.length : 0;
        summary[subject] = totalAssignments;
      });
  
      return summary;
    }; const summaryData = calculateSummary(data.grantProfile[data.currentSem]);
  
    summary.submissionPercentage = (summary.totalSubmissions / summary.totalAssignments) * 100 || 0;
    const handleAtendanceModal = async () => {
      setModalProp({
        func: 2,
        heading: "Attendance Records", // Update heading directly in setModalProp
      });
      const dat = await getUserAttendance(data.id, data.department, data.division, "DAA", data.admissionYear, "student")
      setAttendanceData(dat)
      onOpen()
  
    }
    const handleGrantModal = async () => {
      setModalProp({
        func: 1,
        heading: "Grant Records", // Update heading directly in setModalProp
      });
      setRemarks(data.grantProfileExtras[data.currentSem]?.remarks?.message || "");
      onOpen()
  
    }
    const AttendanceTable = ({ data }) => {
        // Extract unique subjects and dates
        const subjects = {};
        const dates = [];
        
        data.data.forEach(item => {
          dates.push(item.date);
          item.subjectsConducted.forEach(subject => {
            subjects[subject] = true;
          });
        });
        
        const uniqueSubjects = Object.keys(subjects);
        const crossTabData = {};
        
        data.data.forEach(item => {
          item.subjectsConducted.forEach(subject => {
            if (!crossTabData[subject]) {
              crossTabData[subject] = Array(dates.length).fill("");
            }
            crossTabData[subject][dates.indexOf(item.date)] = item.subjectsAttended.includes(subject) ? "🟢" : "🔴";
          });
        });
        
        // Calculate attendance statistics
        const attendanceStats = uniqueSubjects.reduce((acc, subject) => {
          const totalClasses = data.data.reduce((total, day) => {
            return total + (day.subjectsConducted.includes(subject) ? 1 : 0);
          }, 0);
          
          const attendedClasses = data.data.reduce((attended, day) => {
            return attended + (day.subjectsAttended.includes(subject) ? 1 : 0);
          }, 0);
          
          const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
          
          acc[subject] = {
            totalClasses,
            attendedClasses,
            attendancePercentage
          };
          
          return acc;
        }, {});
      
        // Calculate overall attendance percentage
        const totalClassesOverall = uniqueSubjects.reduce((total, subject) => {
          return total + attendanceStats[subject].totalClasses;
        }, 0);
        
        const attendedClassesOverall = uniqueSubjects.reduce((attended, subject) => {
          return attended + attendanceStats[subject].attendedClasses;
        }, 0);
        
        const overallAttendancePercentage = totalClassesOverall > 0 ? (attendedClassesOverall / totalClassesOverall) * 100 : 0;
      
        return (
          <div>
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  {dates.map(date => (
                    <Th key={date}>{new Date(date).toLocaleDateString()}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {uniqueSubjects.map(subject => (
                  <Tr key={subject}>
                    <Td>{subject}</Td>
                    {crossTabData[subject].map((attendance, index) => (
                      <Td key={index}>{attendance}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Table variant="striped" colorScheme="gray" mt={4}>
              <Thead>
                <Tr>
                  <Th>Subject</Th>
                  <Th>Attendance Percentage</Th>
                </Tr>
              </Thead>
              <Tbody>
                {uniqueSubjects.map(subject => (
                  <Tr key={subject}>
                    <Td>{subject}</Td>
                    <Td>
                      <Progress value={attendanceStats[subject].attendancePercentage} colorScheme="green" />
                      {attendanceStats[subject].attendancePercentage.toFixed(2)}%
                    </Td>
                  </Tr>
                ))}
                <Tr>
                  <Td><strong>Overall Attendance</strong></Td>
                  <Td>
                    <Progress value={overallAttendancePercentage} colorScheme="green" />
                    {overallAttendancePercentage.toFixed(2)}%
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </div>
        );
      };
  
    return (
      <>
          <Modal onClose={onClose} size="full" isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
  
              <ModalHeader>{data.name} {modalProp.Heading}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Flex gap="20px">
                  <Input
                    width="60%"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <Button onClick={handleRemarks} colorScheme="blue" mb="4">
                    Add Remarks
                  </Button>
                  <Button onClick={toggleQuickView} colorScheme="blue" mb="4">
                    {quickViewEnabled ? 'Disable Quick View' : 'Enable Quick View'}
                  </Button>
                </Flex>
                {isUploading && (
                  <Box w="100%" position="absolute" top="0" left="0" zIndex="1">
                    <Progress w="100%" h="5px" isIndeterminate />
                  </Box>)}
                {modalProp.func == 1 && <><Table >
                  <Thead>
                    <Tr>
                      <Th>Subject</Th>
                      <Th>Assignments</Th>
                      <Th>UT</Th>
                      <Th>Prelim</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.keys(data.grantProfile[data.currentSem]).map((subject, index) => {
                      const assignments = data.grantProfile[data.currentSem][subject].assignmentsArray;
                      const assignmentTitles = Array.from({ length: assignments.length }, (_, i) => `A${i + 1}`);
  
                      return (
                        <Tr key={index}>
                          <Td>{subject}</Td>
                          <Td>
                            {assignments ? (
                              <Table size="sm" variant="unstyled">
                                <Thead>
                                  <Tr>
                                    {assignmentTitles.map((title, idx) => (
                                      <Th key={idx}>{title}</Th>
                                    ))}
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  <Tr>
                                    {assignments.map((assignment, idx) => (
                                      quickViewEnabled ? (assignment > 0 ? <Td key={idx}>🟢</Td> : <Td key={idx}>🔴</Td>) : <Td key={idx}>{assignment}</Td>
                                    ))}
                                  </Tr>
                                </Tbody>
                              </Table>
                            ) : 'NA'}
                          </Td>
                          <Td>
                            {data.grantProfile[data.currentSem][subject].utData ?
                              (data.grantProfile[data.currentSem][subject].utData.isFailed ? 'Failed' : 'Passed') +
                              (data.grantProfile[data.currentSem][subject].utData.isReappeared ? ' (RE)' : '')
                              :
                              'NA'}
                          </Td>
                          <Td>
                            {data.grantProfile[data.currentSem][subject].prelimData ?
                              (data.grantProfile[data.currentSem][subject].prelimData.isFailed ? 'Failed' : 'Passed') +
                              (data.grantProfile[data.currentSem][subject].prelimData.isReappeared ? ' (RE)' : '')
                              :
                              'NA'}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
                  <ModalHeader>Extras</ModalHeader>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Task</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(data.grantProfileExtras[data.currentSem]).map(([topic, status]) => (
                        topic!="remarks"&&
                        <Tr key={topic}>
                          <Td>{topic}</Td>
                          <Td>{quickViewEnabled ? (status ? "🟢" : "🔴") : status ? "Completed" : "Incomplete"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  {/* </Tbody> */}
                </Table>
              </>
                }
              {modalProp.func == 2 && <AttendanceTable data={attendanceData}></AttendanceTable>}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
          </Modal >
  
  <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
    <Grid
      templateColumns={{ base: "1fr", lg: "1.34fr 4fr" }}
      templateRows={{ base: "repeat(3, 1fr)", lg: "1fr" }}
      gap={{ base: "20px", xl: "20px" }}>
      {!isLoaded ? (
        <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={4} spacing='4' skeletonHeight='2' />} />
      ) : (
        <Banner
          gridArea='1 / 1 / 2 / 2'
          banner={banner}
          avatar={data.name}
          name={data.name}
          post={!data.designation && "Student"}
          dept={`Department of ${data.department}`}
        />
      )}
      <Card>
        <Heading size="md" mb="4">ID: {data.id}</Heading>
        <Stack spacing="4">
          <Text fontWeight="bold">{data.admissionYear} ({getSemesterAbbreviation(data.currentSemester)})</Text>
          <Text fontWeight="bold">CGPA: {data.cgpa}/10</Text>
          <Text fontWeight="bold">Parents Contact: {data.parentsContact}</Text>
          <Text fontWeight="bold">Email:{data.email}</Text>
          <Text fontWeight="bold">CredPoints: {data.credPoints.balance}</Text>
        </Stack>
      </Card>
  
    </Grid>
  
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }}
      gap={6}
      mt={6}>
      <Card>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="md">View Grant Sheet</Heading>
            <Text pt="2" fontSize="sm">Check student's grant sheet details and history.</Text>
            <Button mt="2" colorScheme="blue" onClick={handleGrantModal}>View Grant Sheet</Button>
          </Box>
          <Box>
            <Heading size="md">View Attendance Record</Heading>
            <Text pt="2" fontSize="sm">Check student's attendance records.</Text>
            <Button mt="2" colorScheme="blue" onClick={handleAtendanceModal}>View Attendance</Button>
          </Box>
          <Box>
            <Heading size="md">View Academic Certifications</Heading>
            <Text pt="2" fontSize="sm">Check student's academic performance.</Text>
            <Button mt="2" colorScheme="blue">View Academic Record</Button>
          </Box>
        </Stack>
      </Card>
      <Card>
        <Heading size="md">Termwork Summary</Heading>
        <Stack divider={<StackDivider />} spacing="4">
          <Table colorScheme="gray" >
            <Thead>
              <Tr>
                <Th>Summary</Th>
                <Th>Count</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Total Submissions</Td>
                <Td>{summary.totalSubmissions}/{summary.totalAssignments}</Td>
              </Tr>
              <Tr>
                <Td>Submission Percentage</Td>
                <Td>{summary.submissionPercentage.toFixed(2)}%</Td>
              </Tr>
              <Tr>
                <Td>Failed UT</Td>
                <Td>{summary.failedUT}</Td>
              </Tr>
              <Tr>
                <Td>Failed Prelim</Td>
                <Td>{summary.failedPrelim}</Td>
              </Tr>
              <Tr>
                <Td>Reappeared UT</Td>
                <Td>{summary.reappearedUT}</Td>
              </Tr>
              <Tr>
                <Td>Reappeared Prelim</Td>
                <Td>{summary.reappearedPrelim}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Stack>
      </Card>
    </Grid>
  </Box>
      </>
  
    );
  }