
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
  Progress,
  FormControl,
  FormLabel,
  Switch,
  Textarea,
  Select
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
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { getSubjectStats } from "api/apiService";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { editStaffProfile } from "api/apiService";
export default function Overview() {
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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
  const [statistics, setStatistics] = useState({})
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


  const handleProfileModal = async () => {
    setModalProp({
      func: 1,
      heading: "Edit Profile", // Update heading directly in setModalProp
    });
    onOpen()

  }
  const handleSubjectModal = async () => {
    setModalProp({
      func: 3,
      heading: "Subject Management", // Update heading directly in setModalProp
    });
    onOpen()

  }
  const handleStatistics = async (subject, division, semester, year) => {
    onOpen()
    setIsUploading(true)
    setModalProp({
      func: 2,
      heading: subject + " Statistics", // Update heading directly in setModalProp
    });
    const subData = {
      "subject": subject, "division": division, "semester": semester, "subjectYear": year
    }
    let statisticsd = await getSubjectStats(subData)
    setStatistics(statisticsd)
    setIsUploading(false)


  }

  const Statistics = () => {
    const data = statistics.data
    const pieData = {
      labels: ['UT Appeared', 'UT Failed', 'UT Reappeared', 'Prelim Appeared', 'Prelim Failed', 'Prelim Reappeared'],
      datasets: [
        {
          label: 'UT/Prelim Stats',
          data: [
            data.totalUTAppeared,
            data.totalUTFailed,
            data.totalUTReappeared,
            data.totalPrelimAppeared,
            data.totalPrelimFailed,
            data.totalPrelimReappeared,
          ],
          backgroundColor: ['#E38627', '#C13C37', '#6A2135', '#8B3A3A', '#F88E8E', '#A64242'],
        },
      ],
    };

    const barData = {
      labels: data.assignmentsCompletedCount ? Object.keys(data.assignmentsCompletedCount) : [],
      datasets: [
        {
          label: 'Assignments Completed',
          data: data.assignmentsCompletedCount ? Object.values(data.assignmentsCompletedCount) : [],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    const barOptions = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Assignments',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Student Count',
          },
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false, // Ensure the chart scales correctly
    };

    return (
      <Box>
        <Text fontWeight="bold" mb="2">Summary:</Text>
        <Table variant="simple" mb="4">
          <Thead>
            <Tr>
              <Th>Category</Th>
              <Th>Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Total Students</Td>
              <Td>{data.totalStudents}</Td>
            </Tr>
            <Tr>
              <Td>Total Assignments</Td>
              <Td>{data.totalAssignmentsTotal}</Td>
            </Tr>
          </Tbody>
        </Table>

        <Text fontWeight="bold" mb="2">Assignments Completed:</Text>
        <Table variant="simple" mb="4">
          <Thead>
            <Tr>
              <Th>Assignments Completed</Th>
              <Th>Student Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.assignmentsCompletedCount ? Object.entries(data.assignmentsCompletedCount).map(([assignments, count]) => (
              <Tr key={assignments}>
                <Td>{assignments}</Td>
                <Td>{count}</Td>
              </Tr>
            )) : (
              <Tr>
                <Td colSpan="2">No data available</Td>
              </Tr>
            )}
          </Tbody>
        </Table>




        

        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1.34fr 4fr" }}
            templateRows={{ base: "repeat(3, 1fr)", lg: "1fr" }}
            gap={{ base: "20px", xl: "20px" }}>
            <Card>
            <Text fontWeight="bold" mb="2">Assignments Stats</Text>
              <Box width="300px" height="300px"> {/* Adjust width and height here */}
                <Bar data={barData} options={barOptions} />
              </Box>
            </Card>
            <Card>

            <Box width="300px" height="300px"> 
        <Text fontWeight="bold" mb="2">UT/Prelim Stats</Text>
            {/* Adjust width and height here */}
              <Pie data={pieData} />
            </Box>
            </Card>

          </Grid>
        </Box>
      </Box>
    );
  };
  const EditStaffProfile = () => {
    const [profile, setProfile] = useState(data);
  
    const handleChange = (field, value) => {
      setProfile({
        ...profile,
        [field]: value,
      });
    };
  
    const handleTempAdminChange = (field, value) => {
      setProfile({
        ...profile,
        tempAdmin: {
          ...profile.tempAdmin,
          [field]: value,
        },
      });
    };
  
    const handleSubmit = async() => {
      setIsUploading(true)
      const updatedProfile = {
        id: profile.id,
        updatedProfile: profile,
      };
      // Send updatedProfile to your API endpoint here
      await editStaffProfile(updatedProfile)
      setIsUploading(false)
    };
  
    return (
      <Box>
        <FormControl id="name" mb="4">
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FormControl>
  
        <FormControl id="contact" mb="4">
          <FormLabel>Contact</FormLabel>
          <Input
            type="tel"
            value={profile.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
          />
        </FormControl>
  
        <FormControl id="email" mb="4">
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={profile.email}
            disabled
          />
        </FormControl>
  
        <FormControl id="designation" mb="4">
          <FormLabel>Designation</FormLabel>
          <Input
            type="text"
            value={profile.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
        </FormControl>
  
        <FormControl id="department" mb="4">
          <FormLabel>Department</FormLabel>
          <Input
            type="text"
            value={profile.department}
            disabled
          />
        </FormControl>
  
        <FormControl display="flex" alignItems="center" mb="4">
          <FormLabel htmlFor="isTeaching">Is Teaching</FormLabel>
          <Switch
            id="isTeaching"
            isChecked={profile.isTeaching}
            onChange={(e) => handleChange('isTeaching', e.target.checked)}
          />
        </FormControl>
  
        <FormControl display="flex" alignItems="center" mb="4">
          <FormLabel htmlFor="isAdmin">Is Admin</FormLabel>
          <Switch
            id="isAdmin"
            isChecked={profile.tempAdmin.isAdmin}
            onChange={(e) => handleTempAdminChange('isAdmin', e.target.checked)}
          />
        </FormControl>
  
        <FormControl id="expiresOn" mb="4">
          <FormLabel>Admin Expires On</FormLabel>
          <Input
            type="date"
            value={profile.tempAdmin.expiresOn || ''}
            onChange={(e) => handleTempAdminChange('expiresOn', e.target.value)}
          />
        </FormControl>
  
        <FormControl id="customRights" mb="4">
          <FormLabel>Custom Rights</FormLabel>
          <Textarea
            value={profile.tempAdmin.customRights || ''}
            onChange={(e) => handleTempAdminChange('customRights', e.target.value)}
          />
        </FormControl>
  
        <Button colorScheme="teal" onClick={handleSubmit}>Save</Button>
      </Box>
    );
  };
  const SubjectAllocationForm = ({ teacherId }) => {
    const [departments, setDepartments] = useState([]);
    const [semesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
    const [subjects, setSubjects] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [allocatedSubjects, setAllocatedSubjects] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
  
    const [isLoading, setIsLoading] = useState(false);
  
    // Fetch departments dynamically from Firestore
    useEffect(() => {
      async function fetchDepartments() {
        setIsLoading(true);
        try {
          // Assume departments are stored in a Firestore collection "departments"
          const departmentsSnapshot = await firebase.firestore().collection("departments").get();
          const departmentList = departmentsSnapshot.docs.map((doc) => doc.data().name);
          setDepartments(departmentList);
        } catch (error) {
          console.error("Error fetching departments:", error);
        }
        setIsLoading(false);
      }
      fetchDepartments();
    }, []);
  
    // Fetch subjects dynamically based on department and semester
    // Fetch subjects dynamically based on department and semester
useEffect(() => {
  async function fetchSubjects() {
    if (!selectedDepartment || !selectedSemester) return;
    setIsLoading(true);
    try {
      // Fetch subjects from Firestore based on department and semester
      const subjectsSnapshot = await firebase.firestore()
        .collection('subjects')
        .where('department', '==', selectedDepartment)
        .where('semester', '==', parseInt(selectedSemester))
        .get();

      // Map the subjects from Firestore to an array
      const subjectsList = subjectsSnapshot.docs.map((doc) => doc.data());

      setSubjects(subjectsList);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
    setIsLoading(false);
  }

  fetchSubjects();
}, [selectedDepartment, selectedSemester]);

  
    // Fetch allocated subjects dynamically
    useEffect(() => {
      async function fetchAllocatedSubjects() {
        if (!teacherId) return;
        setIsLoading(true);
        try {
          // Assume allocated subjects are stored in a Firestore document under "teachers/{teacherId}"
          const teacherDoc = await firebase.firestore().doc(`teachers/${teacherId}`).get();
          if (teacherDoc.exists) {
            const data = teacherDoc.data();
            setAllocatedSubjects(data.subjectsAllocated || []);
          }
        } catch (error) {
          console.error("Error fetching allocated subjects:", error);
        }
        setIsLoading(false);
      }
      fetchAllocatedSubjects();
    }, [teacherId]);
  
    const handleAllocation = async () => {
      if (!selectedSubject || !selectedDivision || !selectedSemester) {
        alert("Please select all fields before allocating.");
        return;
      }
  
      setIsLoading(true);
      try {
        const allocationData = {
          subject: selectedSubject,
          division: selectedDivision,
          semester: parseInt(selectedSemester),
          department: selectedDepartment,
        };
  
        // Update Firestore with allocated subject
        await firebase.firestore().doc(`teachers/${teacherId}`).update({
          [`subjectsAllocated.${selectedSubject}`]: allocationData,
        });
  
        // Refresh allocated subjects
        setAllocatedSubjects((prev) => [...prev, allocationData]);
        alert("Subject allocated successfully.");
      } catch (error) {
        console.error("Error allocating subject:", error);
        alert("Failed to allocate subject.");
      }
      setIsLoading(false);
    };
  
    const handleRevocation = async (subject) => {
      setIsLoading(true);
      try {
        // Remove subject allocation from Firestore
        await firebase.firestore().doc(`teachers/${teacherId}`).update({
          [`subjectsAllocated.${subject}`]: firebase.firestore.FieldValue.delete(),
        });
  
        // Refresh allocated subjects
        setAllocatedSubjects((prev) => prev.filter((s) => s.subject !== subject));
        alert("Subject revoked successfully.");
      } catch (error) {
        console.error("Error revoking subject:", error);
        alert("Failed to revoke subject.");
      }
      setIsLoading(false);
    };
  
    return (
      <Box>
        <Heading size="md" mb="4">Subject Allocation</Heading>
        {isLoading && <Progress size="xs" isIndeterminate mb="4" />}
  
        <FormControl mb="4">
          <FormLabel>Department</FormLabel>
          <Select placeholder="Select Department" onChange={(e) => setSelectedDepartment(e.target.value)}>
            {departments.map((department, index) => (
              <option key={index} value={department}>{department}</option>
            ))}
          </Select>
        </FormControl>
  
        <FormControl mb="4">
          <FormLabel>Semester</FormLabel>
          <Select placeholder="Select Semester" onChange={(e) => setSelectedSemester(e.target.value)}>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>{`Semester ${semester}`}</option>
            ))}
          </Select>
        </FormControl>
  
        <FormControl mb="4">
          <FormLabel>Division</FormLabel>
          <Input placeholder="Enter Division (e.g., A, B)" value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)} />
        </FormControl>
  
        <FormControl mb="4">
          <FormLabel>Subject</FormLabel>
          <Select placeholder="Select Subject" onChange={(e) => setSelectedSubject(e.target.value)}>
            {subjects.map((subject, index) => (
              <option key={index} value={subject.subjectName}>{subject.subjectName}</option>
            ))}
          </Select>
        </FormControl>
  
        <Button colorScheme="blue" onClick={handleAllocation} disabled={isLoading || !selectedSubject}>
          Allocate Subject
        </Button>
  
        <Heading size="md" mt="8" mb="4">Allocated Subjects</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Subject</Th>
              <Th>Division</Th>
              <Th>Semester</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {allocatedSubjects.map((subject, index) => (
              <Tr key={index}>
                <Td>{subject.subject}</Td>
                <Td>{subject.division}</Td>
                <Td>{`Semester ${subject.semester}`}</Td>
                <Td>
                  <Button colorScheme="red" size="sm" onClick={() => handleRevocation(subject.subject)}>
                    Revoke
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
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

            </Flex>
            {isUploading && (
              <Box w="100%" position="absolute" top="0" left="0" zIndex="1">
                <Progress w="100%" h="5px" isIndeterminate />
              </Box>)}
            {modalProp.func == 2 && !isUploading && <><Statistics /></>}
            {modalProp.func == 1 && !isUploading && <><EditStaffProfile /></>}
            {modalProp.func == 3 && !isUploading && <><SubjectAllocationForm /></>}
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
              post={data.designation}
              dept={`Department of ${data.department}`}
            />
          )}
          <Card>
            <Heading size="md" mb="4">ID: {data.id}</Heading>
            <Stack spacing="4">
              <Text fontWeight="bold">{data.tempAdmin.isAdmin ? `Temporary Administrator till (${data.tempAdmin.expiresOn})` : "Moderator"}</Text>
              <Text fontWeight="bold">{data.isTeaching ? "Teaching" : "Available for teaching"}</Text>
              <Text fontWeight="bold">Contact: {data.contact}</Text>
              <Text fontWeight="bold">Email:{data.email}</Text>
          <Box>
                <Button mt="2" mr="2" colorScheme="blue" onClick={handleProfileModal}>Edit</Button>
                <Button mt="2" colorScheme="blue" onClick={handleSubjectModal}>Subject Allocation</Button>
              </Box>
              
            </Stack>
          
          </Card>
          

        </Grid>

        <Grid
          // templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }}
          templateColumns={{ base: "1fr", lg: "1.34fr 2fr" }}
          gap={6}
          mt={6}>
          <Card>
            <Heading size="md">Subjects Allocated</Heading>
            <Stack divider={<StackDivider />} spacing="4">
              <Box mt="4">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th><b>Subject</b></Th>
                      <Th><b>Division</b></Th>
                      <Th><b>Semester</b></Th>
                      <Th><b>Statistics</b></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.keys(data.subjectsAllocated).map((subject, index) => (
                      <Tr key={index}>
                        <Td><b>{subject}</b></Td>
                        <Td><b>{data.subjectsAllocated[subject].division}</b></Td>
                        <Td><b>{getSemesterAbbreviation(data.subjectsAllocated[subject].semester)}</b></Td>
                        <Td><ExternalLinkIcon onClick={() => handleStatistics(subject, data.subjectsAllocated[subject].division, data.subjectsAllocated[subject].semester, data.subjectsAllocated[subject].subjectYear)} /></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Box>
    </>

  );
}