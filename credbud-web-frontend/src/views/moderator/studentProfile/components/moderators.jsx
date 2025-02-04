
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
  const SubjectAllocationForm=()=> {
    const [allocationData, setAllocationData] = useState({
      subject: '',
      division: '',
      semester: '',
      subjectYear: ''
    });
    const [revocationData, setRevocationData] = useState({
      subject: ''
    });
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
  
    const onSubmitAllocation = (teacherId, allocationData) => {
      // Add logic to handle allocation submission
      console.log('Allocation submitted:', teacherId, allocationData);
    };
  
    const onSubmitRevocation = (teacherId, revocationData) => {
      // Add logic to handle revocation submission
      console.log('Revocation submitted:', teacherId, revocationData);
    };
  
    const handleAllocationSubmit = (e) => {
      e.preventDefault();
      onSubmitAllocation(allocationData);
      // Reset form fields
      setAllocationData({
        subject: '',
        division: '',
        semester: '',
        subjectYear: ''
      });
    };
  
    const handleRevocationSubmit = (e) => {
      e.preventDefault();
      onSubmitRevocation(revocationData);
      // Reset form fields
      setRevocationData({ subject: '' });
    };
  
    return (
      <div>
        <form onSubmit={handleAllocationSubmit}>
          <h3>Allocate Subject</h3>
          <label>
            Year:
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">Select Year</option>
              {/* Populate options with years */}
              {/* Assuming years are provided as props */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Semester:
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
              <option value="">Select Semester</option>
              {/* Populate options with semesters based on selected year */}
              {/* Assuming semesters are provided as props */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Subject:
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">Select Subject</option>
              {/* Populate options with subjects based on selected semester */}
              {/* Assuming subjects are provided as props */}
              {['Subject1', 'Subject2', 'Subject3', 'Subject4', 'Subject5'].map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Division:
            <input
              type="text"
              value={allocationData.division}
              onChange={(e) => setAllocationData({ ...allocationData, division: e.target.value })}
            />
          </label>
          <br />
          <button type="submit" disabled={!selectedSubject}>Allocate</button>
        </form>
  
        <form onSubmit={handleRevocationSubmit}>
          <h3>Revoke Subject</h3>
          <label>
            Subject:
            <input
              type="text"
              value={revocationData.subject}
              onChange={(e) => setRevocationData({ ...revocationData, subject: e.target.value })}
            />
          </label>
          <br />
          <button type="submit" disabled={!revocationData.subject}>Revoke</button>
        </form>
      </div>
    );
  }
  
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