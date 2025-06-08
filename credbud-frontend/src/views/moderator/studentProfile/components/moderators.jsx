import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SkeletonText,
  Avatar,
  Box,
  Grid,
  Button,
  Heading,
  Stack,
  StackDivider,
  Text,
  UnorderedList,
  ListItem,
  useDisclosure,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Input,
  Flex,
  Progress,
  FormControl,
  FormLabel,
  Switch,
  Textarea,
  Select,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Custom components
import Banner from "views/admin/profile/components/Banner";
import Card from "components/card/Card";

// Assets
import banner from "assets/img/auth/banner.png";

// API services
import { useUserAuth } from "contexts/UserAuthContext";
import { searchUser } from "api/apiService";
import { getSubjectStats } from "api/apiService";
import { editStaffProfile } from "api/apiService";
import { allocateSubject, revokeSubject } from "api/apiService";

// Sample subject data
const SUBJECTS_BY_SEMESTER = {
  1: [
    "Applied Mathematics I",
    "Applied Physics I",
    "Applied Chemistry",
    "Engineering Mechanics",
    "Basic Electrical Engineering",
  ],
  2: [
    "Applied Mathematics II",
    "Applied Physics II",
    "Engineering Drawing",
    "Structured Programming Approach",
    "Basic Electronics Engineering",
  ],
  3: [
    "Applied Mathematics III",
    "Data Structures",
    "Discrete Mathematics",
    "Digital Logic and Computer Organization",
    "Electronic Circuits",
  ],
  4: [
    "Applied Mathematics IV",
    "Analysis of Algorithms",
    "Operating Systems",
    "Computer Networks",
    "Database Management Systems",
  ],
  5: [
    "Microprocessor",
    "Theory of Computation",
    "Software Engineering",
    "Computer Graphics",
    "Web Technologies",
  ],
  6: [
    "System Programming and Compiler Construction",
    "Distributed Systems",
    "Artificial Intelligence",
    "Machine Learning",
    "Cyber Security",
  ],
  7: [
    "Advanced Database Management Systems",
    "Cloud Computing",
    "Big Data Analytics",
    "Internet of Things",
    "Blockchain Technology",
  ],
  8: [
    "Project Work",
    "Advanced Topics in Computer Engineering",
    "Entrepreneurship Development",
    "Professional Ethics",
  ],
};

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Overview() {
  const [modalProp, setModalProp] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState({});
  const { searchedProfile } = useUserAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { id, userType } = useParams();
  const mainText = useColorModeValue("navy.700", "white");
  const secondaryText = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        if (!searchedProfile) {
          const userData = await searchUser(id, "id", userType);
          setData(userData[0]?.data || {});
        } else {
          setData(searchedProfile.data || {});
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsLoaded(true);
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    fetchData();
  }, [id, userType, searchedProfile, toast]);

  function getSemesterAbbreviation(currentSemester) {
    let abbreviation;
    switch (currentSemester) {
      case 1:
      case 2:
        abbreviation = "FE"; // First Year Engineering
        break;
      case 3:
      case 4:
        abbreviation = "SE"; // Second Year Engineering
        break;
      case 5:
      case 6:
        abbreviation = "TE"; // Third Year Engineering
        break;
      case 7:
      case 8:
        abbreviation = "BE"; // Final Year Engineering
        break;
      default:
        abbreviation = "NA";
    }
    return abbreviation;
  }

  const handleProfileModal = async () => {
    setModalProp({
      func: 1,
      heading: "Edit Profile",
    });
    onOpen();
  };

  const handleSubjectModal = async () => {
    setModalProp({
      func: 3,
      heading: "Subject Management",
    });
    onOpen();
  };

  const handleStatistics = async (subject, division, semester, year) => {
    try {
      onOpen();
      setIsUploading(true);
      setModalProp({
        func: 2,
        heading: `${subject} Statistics`,
      });
      const subData = {
        subject,
        division,
        semester,
        subjectYear: year,
      };
      const statisticsd = await getSubjectStats(subData);
      setStatistics(statisticsd);
    } catch (error) {
      console.error("Error fetching subject statistics:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch subject statistics. You may not have permission.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  const Statistics = () => {
    const data = statistics.data || {};
    const pieData = {
      labels: [
        "UT Appeared",
        "UT Failed",
        "UT Reappeared",
        "Prelim Appeared",
        "Prelim Failed",
        "Prelim Reappeared",
      ],
      datasets: [
        {
          label: "UT/Prelim Stats",
          data: [
            data.totalUTAppeared || 0,
            data.totalUTFailed || 0,
            data.totalUTReappeared || 0,
            data.totalPrelimAppeared || 0,
            data.totalPrelimFailed || 0,
            data.totalPrelimReappeared || 0,
          ],
          backgroundColor: [
            "#E38627",
            "#C13C37",
            "#6A2135",
            "#8B3A3A",
            "#F88E8E",
            "#A64242",
          ],
        },
      ],
    };

    const barData = {
      labels: data.assignmentsCompletedCount
        ? Object.keys(data.assignmentsCompletedCount)
        : [],
      datasets: [
        {
          label: "Assignments Completed",
          data: data.assignmentsCompletedCount
            ? Object.values(data.assignmentsCompletedCount)
            : [],
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    const barOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Assignments Completed by Students",
        },
      },
    };

    const pieOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "UT/Prelim Performance",
        },
      },
    };

    return (
      <Box>
        <Text fontWeight="bold" mb="2">
          Summary:
        </Text>
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
              <Td>{data.totalStudents || 0}</Td>
            </Tr>
            <Tr>
              <Td>Total Assignments</Td>
              <Td>{data.totalAssignmentsTotal || 0}</Td>
            </Tr>
          </Tbody>
        </Table>

        <Text fontWeight="bold" mb="2">
          Assignments Completed:
        </Text>
        <Table variant="simple" mb="4">
          <Thead>
            <Tr>
              <Th>Assignments Completed</Th>
              <Th>Student Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.assignmentsCompletedCount ? (
              Object.entries(data.assignmentsCompletedCount).map(
                ([assignments, count]) => (
                  <Tr key={assignments}>
                    <Td>{assignments}</Td>
                    <Td>{count}</Td>
                  </Tr>
                )
              )
            ) : (
              <Tr>
                <Td colSpan="2">No data available</Td>
              </Tr>
            )}
          </Tbody>
        </Table>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>
          <Card p={4}>
            <Text fontWeight="bold" mb="2">
              Assignments Stats
            </Text>
            <Box height="300px">
              <Bar data={barData} options={barOptions} />
            </Box>
          </Card>
          <Card p={4}>
            <Text fontWeight="bold" mb="2">
              UT/Prelim Stats
            </Text>
            <Box height="300px">
              <Pie data={pieData} options={pieOptions} />
            </Box>
          </Card>
        </SimpleGrid>
      </Box>
    );
  };

  const EditStaffProfile = () => {
    const [profile, setProfile] = useState(data);

    const handleChange = (field, value) => {
      setProfile((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleTempAdminChange = (field, value) => {
      setProfile((prev) => ({
        ...prev,
        tempAdmin: {
          ...(prev.tempAdmin || {}),
          [field]: value,
        },
      }));
    };

    const handleSubmit = async () => {
      setIsUploading(true);
      try {
        const updatedProfile = {
          id: profile.id,
          updatedProfile: profile,
        };
        await editStaffProfile(updatedProfile);
        setData(profile);
        toast({
          title: "Success",
          description: "Profile updated successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
      } catch (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <Box>
        <FormControl id="name" mb="4">
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            value={profile.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </FormControl>

        <FormControl id="contact" mb="4">
          <FormLabel>Contact</FormLabel>
          <Input
            type="tel"
            value={profile.contact || ""}
            onChange={(e) => handleChange("contact", e.target.value)}
          />
        </FormControl>

        <FormControl id="email" mb="4">
          <FormLabel>Email</FormLabel>
          <Input type="email" value={profile.email || ""} disabled />
        </FormControl>

        <FormControl id="designation" mb="4">
          <FormLabel>Designation</FormLabel>
          <Input
            type="text"
            value={profile.designation || ""}
            onChange={(e) => handleChange("designation", e.target.value)}
          />
        </FormControl>

        <FormControl id="department" mb="4">
          <FormLabel>Department</FormLabel>
          <Input type="text" value={profile.department || ""} disabled />
        </FormControl>

        <FormControl display="flex" alignItems="center" mb="4">
          <FormLabel htmlFor="isTeaching" mb="0">
            Is Teaching
          </FormLabel>
          <Switch
            id="isTeaching"
            isChecked={profile.isTeaching || false}
            onChange={(e) => handleChange("isTeaching", e.target.checked)}
          />
        </FormControl>

        <FormControl display="flex" alignItems="center" mb="4">
          <FormLabel htmlFor="isAdmin" mb="0">
            Is Admin
          </FormLabel>
          <Switch
            id="isAdmin"
            isChecked={profile.tempAdmin?.isAdmin || false}
            onChange={(e) => handleTempAdminChange("isAdmin", e.target.checked)}
          />
        </FormControl>

        <FormControl id="expiresOn" mb="4">
          <FormLabel>Admin Expires On</FormLabel>
          <Input
            type="date"
            value={profile.tempAdmin?.expiresOn || ""}
            onChange={(e) => handleTempAdminChange("expiresOn", e.target.value)}
          />
        </FormControl>

        <FormControl id="customRights" mb="4">
          <FormLabel>Custom Rights</FormLabel>
          <Textarea
            value={profile.tempAdmin?.customRights || ""}
            onChange={(e) =>
              handleTempAdminChange("customRights", e.target.value)
            }
          />
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={isUploading}
        >
          Save Changes
        </Button>
      </Box>
    );
  };

  const SubjectAllocationForm = () => {
    const [allocationData, setAllocationData] = useState({
      subject: "",
      division: "",
      semester: "",
      subjectYear: "",
    });
    const [revocationData, setRevocationData] = useState({
      subject: "",
    });
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
      if (allocationData.semester) {
        setAvailableSubjects(
          SUBJECTS_BY_SEMESTER[allocationData.semester] || []
        );
      }
    }, [allocationData.semester]);

    const handleAllocationChange = (field, value) => {
      setAllocationData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleRevocationChange = (field, value) => {
      setRevocationData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleAllocationSubmit = async (e) => {
      e.preventDefault();
      setIsUploading(true);
      setSuccessMessage("");
      setErrorMessage("");

      try {
        const response = await allocateSubject({
          teacherId: data.id,
          ...allocationData,
        });

        if (response.success) {
          setSuccessMessage(response.message);
          setData((prev) => ({
            ...prev,
            subjectsAllocated: {
              ...(prev.subjectsAllocated || {}),
              [allocationData.subject]: {
                division: allocationData.division,
                semester: allocationData.semester,
                subjectYear: allocationData.subjectYear,
              },
            },
          }));
          setAllocationData({
            subject: "",
            division: "",
            semester: "",
            subjectYear: "",
          });
        } else {
          setErrorMessage(response.message || "Failed to allocate subject");
        }
      } catch (error) {
        setErrorMessage("An error occurred while allocating subject");
        console.error("Allocation error:", error);
      } finally {
        setIsUploading(false);
      }
    };

    const handleRevocationSubmit = async (e) => {
      e.preventDefault();
      setIsUploading(true);
      setSuccessMessage("");
      setErrorMessage("");

      try {
        const response = await revokeSubject({
          teacherId: data.id,
          ...revocationData,
        });

        if (response.success) {
          setSuccessMessage(response.message);
          setData((prev) => {
            const newSubjectsAllocated = { ...prev.subjectsAllocated };
            delete newSubjectsAllocated[revocationData.subject];
            return {
              ...prev,
              subjectsAllocated: newSubjectsAllocated,
            };
          });
          setRevocationData({ subject: "" });
        } else {
          setErrorMessage(response.message || "Failed to revoke subject");
        }
      } catch (error) {
        setErrorMessage("An error occurred while revoking subject");
        console.error("Revocation error:", error);
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <Box>
        {successMessage && (
          <Text color="green.500" mb={4}>
            {successMessage}
          </Text>
        )}
        {errorMessage && (
          <Text color="red.500" mb={4}>
            {errorMessage}
          </Text>
        )}

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Allocation Form */}
          <Card p={4}>
            <Heading size="md" mb={4}>
              Allocate New Subject
            </Heading>
            <form onSubmit={handleAllocationSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel>Year</FormLabel>
                <Select
                  placeholder="Select year"
                  value={allocationData.subjectYear}
                  onChange={(e) =>
                    handleAllocationChange("subjectYear", e.target.value)
                  }
                >
                  {[1, 2, 3, 4].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Semester</FormLabel>
                <Select
                  placeholder="Select semester"
                  value={allocationData.semester}
                  onChange={(e) =>
                    handleAllocationChange("semester", e.target.value)
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Subject</FormLabel>
                <Select
                  placeholder="Select subject"
                  value={allocationData.subject}
                  onChange={(e) =>
                    handleAllocationChange("subject", e.target.value)
                  }
                  isDisabled={!allocationData.semester}
                >
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Division</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter division (e.g., A, B)"
                  value={allocationData.division}
                  onChange={(e) =>
                    handleAllocationChange("division", e.target.value)
                  }
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isUploading}
                isDisabled={
                  !allocationData.subject ||
                  !allocationData.division ||
                  !allocationData.semester ||
                  !allocationData.subjectYear
                }
              >
                Allocate Subject
              </Button>
            </form>
          </Card>

          {/* Revocation Form */}
          <Card p={4}>
            <Heading size="md" mb={4}>
              Revoke Existing Subject
            </Heading>
            <form onSubmit={handleRevocationSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel>Subject</FormLabel>
                <Select
                  placeholder="Select subject to revoke"
                  value={revocationData.subject}
                  onChange={(e) =>
                    handleRevocationChange("subject", e.target.value)
                  }
                >
                  {Object.keys(data.subjectsAllocated || {}).map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                colorScheme="red"
                isLoading={isUploading}
                isDisabled={!revocationData.subject}
              >
                Revoke Subject
              </Button>
            </form>
          </Card>
        </SimpleGrid>
      </Box>
    );
  };

  if (!isLoaded || !data) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
      </Box>
    );
  }

  return (
    <>
      <Modal onClose={onClose} size="full" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalProp.heading}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isUploading && (
              <Box w="100%" position="absolute" top="0" left="0" zIndex="1">
                <Progress w="100%" h="5px" isIndeterminate />
              </Box>
            )}
            {modalProp.func === 2 && !isUploading && <Statistics />}
            {modalProp.func === 1 && !isUploading && <EditStaffProfile />}
            {modalProp.func === 3 && !isUploading && <SubjectAllocationForm />}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Grid
          templateColumns={{ base: "1fr", lg: "1.34fr 4fr" }}
          templateRows={{ base: "repeat(3, 1fr)", lg: "1fr" }}
          gap={{ base: "20px", xl: "20px" }}
        >
          <Banner
            gridArea="1 / 1 / 2 / 2"
            banner={banner}
            avatar={data.name}
            name={data.name}
            post={data.designation}
            dept={`Department of ${data.department}`}
          />
          <Card p={4}>
            <Heading size="md" mb={4}>
              ID: {data.id}
            </Heading>
            <Stack spacing={4}>
              <Text fontWeight="bold">
                {data.tempAdmin?.isAdmin
                  ? `Temporary Administrator till (${
                      data.tempAdmin?.expiresOn || "N/A"
                    })`
                  : "Moderator"}
              </Text>
              <Text fontWeight="bold">
                {data.isTeaching ? "Teaching Faculty" : "Non-Teaching Staff"}
              </Text>
              <Text fontWeight="bold">
                Contact: {data.contact || "Not provided"}
              </Text>
              <Text fontWeight="bold">Email: {data.email}</Text>
              <Box>
                <Button
                  mt={2}
                  mr={2}
                  colorScheme="blue"
                  onClick={handleProfileModal}
                >
                  Edit Profile
                </Button>
                <Button mt={2} colorScheme="blue" onClick={handleSubjectModal}>
                  Subject Allocation
                </Button>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid
          templateColumns={{ base: "1fr", lg: "1.34fr 2fr" }}
          gap={6}
          mt={6}
        >
          <Card p={4}>
            <Heading size="md" mb={4}>
              Subjects Allocated
            </Heading>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>
                      <b>Subject</b>
                    </Th>
                    <Th>
                      <b>Division</b>
                    </Th>
                    <Th>
                      <b>Semester</b>
                    </Th>
                    <Th>
                      <b>Actions</b>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.keys(data.subjectsAllocated || {}).map(
                    (subject, index) => (
                      <Tr key={index}>
                        <Td>
                          <b>{subject}</b>
                        </Td>
                        <Td>
                          <b>{data.subjectsAllocated[subject].division}</b>
                        </Td>
                        <Td>
                          <b>
                            {getSemesterAbbreviation(
                              data.subjectsAllocated[subject].semester
                            )}
                          </b>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            leftIcon={<ExternalLinkIcon />}
                            onClick={() =>
                              handleStatistics(
                                subject,
                                data.subjectsAllocated[subject].division,
                                data.subjectsAllocated[subject].semester,
                                data.subjectsAllocated[subject].subjectYear
                              )
                            }
                          >
                            View Stats
                          </Button>
                        </Td>
                      </Tr>
                    )
                  )}
                  {Object.keys(data.subjectsAllocated || {}).length === 0 && (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        No subjects allocated yet
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Card>
        </Grid>
      </Box>
    </>
  );
}
