
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Flex,
  FormLabel,
  Icon,
  Text,
  Select,
  SimpleGrid,
  useColorModeValue,
  Heading,
  Container,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Switch,
  FormControl,
  Input,
  HStack,
  IconButton,
  GridItem,
  Grid,
} from "@chakra-ui/react";
import { getStats } from "api/apiService";
import { addExtras } from "api/apiService";
import { updateTerm } from "api/apiService";

import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import { HSeparator } from "components/separator/Separator";
import React, { useEffect, useState } from "react";
import {
  MdAddTask,
  MdArrowForward,
  MdAttachMoney,
  MdBarChart,
  MdFileCopy,
} from "react-icons/md";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function UserReports() {
  const history = useHistory()

  const addExtrasToGrantSheet = async (data) => {
    const req = await addExtras(data);
    return { success: true };
  };
  const [stats,setStats]=useState(null)
  useEffect(() => {
    const stats = async () => { const dat = await getStats()
      setStats(dat)
     }
     stats()
  },[getStats,setStats])
  const AddExtrasForm = () => {
    const [admissionYear, setAdmissionYear] = useState('');
    const [department, setDepartment] = useState('');
    const [semester, setSemester] = useState('');
    const [extras, setExtras] = useState([{ name: '', status: false }]);

    const handleAddExtra = () => {
      setExtras([...extras, { name: '', status: false }]);
    };

    const handleRemoveExtra = (index) => {
      const newExtras = extras.filter((_, i) => i !== index);
      setExtras(newExtras);
    };

    const handleExtraChange = (index, field, value) => {
      const newExtras = extras.map((extra, i) =>
        i === index ? { ...extra, [field]: value } : extra
      );
      setExtras(newExtras);
    };

    const handleSubmit = async () => {
      const extrasData = {
        admissionYear: parseInt(admissionYear),
        department: "Computer",
        semester: parseInt(semester),
        extras: extras.reduce((acc, extra) => {
          acc[extra.name] = extra.status;
          return acc;
        }, {}),
      };

      const response = await addExtrasToGrantSheet(extrasData);
      if (response.success) {
        alert('Extras added successfully');
      } else {
        alert('Failed to add extras');
      }
    };

    return (
      <Box
        width="400px"
        margin="auto"
        padding="20px"
        boxShadow="lg"
        borderRadius="md"
        background="white"
      >
        <VStack spacing="4">
          <FormControl id="admissionYear">
            <FormLabel>Admission Year</FormLabel>
            <Input
              type="number"
              value={admissionYear}
              onChange={(e) => setAdmissionYear(e.target.value)}
            />
          </FormControl>
          <FormControl id="department">
            <FormLabel>Department</FormLabel>
            <Input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </FormControl>
          <FormControl id="semester">
            <FormLabel>Semester</FormLabel>
            <Input
              type="number"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
          </FormControl>

          {extras.map((extra, index) => (
            // <HStack key={index} spacing="4" width="100%">
            <Grid key={index} templateColumns="repeat(12, 1fr)" gap={4} alignItems="center" width="100%">
              <GridItem colSpan={5}>
                <FormControl id={`extraName-${index}`}>
                  <FormLabel>Extra Field Name</FormLabel>
                  <Input
                    type="text"
                    value={extra.name}
                    onChange={(e) => handleExtraChange(index, 'name', e.target.value)}
                  />
                </FormControl>
              </GridItem>
              <GridItem colSpan={5}>
                <FormControl htmlFor={`extraStatus-${index}`} display="flex" alignItems="center">
                  <FormLabel>Status</FormLabel>
                  <Select
                    id={`extraStatus-${index}`}
                    value={extra.status}
                    onChange={(e) => handleExtraChange(index, 'status', e.target.value === 'true')}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <IconButton
                  aria-label="Delete Extra Field"
                  icon={<DeleteIcon />}
                  onClick={() => handleRemoveExtra(index)}
                />
              </GridItem>
            </Grid>
            // </HStack>
          ))}

          <Button leftIcon={<AddIcon />} onClick={handleAddExtra}>
            Add Extra Field
          </Button>

          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit
          </Button>
        </VStack>
      </Box>

    );
  }


  const UpdateTermForm = () => {
    const [updateType, setUpdateType] = useState('admissionYear');
    const [department, setDepartment] = useState('');
    const [admissionYear, setAdmissionYear] = useState('');
    const [updatedSem, setUpdatedSem] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();

      const formData = {
        updateType,
        department,
        admissionYear: parseInt(admissionYear),
        updatedSem: parseInt(updatedSem),
      };

      try {
        // Replace the URL with your actual API endpoint

        const response = await updateTerm(formData)
        console.log('Form submitted successfully:', response.data);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    };

    const inputBg = useColorModeValue('white', 'gray.700');
    const buttonBg = useColorModeValue('brand.500', 'white');
    const buttonColor = useColorModeValue('white', 'black');
    const buttonHoverBg = useColorModeValue('brand.600', 'gray.200');

    return (
      <Box bg={inputBg} p={4} borderRadius="md" boxShadow="md">
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="updateType">
              <FormLabel>Update Type</FormLabel>
              <Select value={updateType} onChange={(e) => setUpdateType(e.target.value)}>
                <option value="admissionYear">Admission Year</option>
                {/* Add other update types as needed */}
              </Select>
            </FormControl>

            <FormControl id="department">
              <FormLabel>Department</FormLabel>
              <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="Computer">Computer</option>
                <option value="IT">IT</option>
                <option value="Entc">EnTC</option>
                <option value="Civil">Civil</option>
                <option value="Mechanical">Mechanical</option>
                {/* Add other update types as needed */}
              </Select>
            </FormControl>

            <FormControl id="admissionYear">
              <FormLabel>Admission Year</FormLabel>
              <Input
                type="number" min="1900" max="2099" step="1"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(e.target.value)}
              />
            </FormControl>

            <FormControl id="updatedSem">
              <FormLabel>Updated Term</FormLabel>
              <Input
                type="number"
                value={updatedSem}
                onChange={(e) => setUpdatedSem(e.target.value)}
              />
            </FormControl>

            <Button
              type="submit"
              bg={buttonBg}
              color={buttonColor}
              _hover={{ bg: buttonHoverBg }}
            >
              Update Term
            </Button>
          </VStack>
        </form>
      </Box>
    );
  };


  // Chakra Color Mode
  const { isOpen, onOpen, onClose } = useDisclosure()
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const [modal, setModal] = useState(null)
  const handleModal = (type) => {
    setModal(type)
    onOpen()

  }
  return (<>
    <Modal onClose={onClose} size="md" isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modal === "term" ? "Update Term": "Add Extra to GrantSheet"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {modal === "term" ? <UpdateTermForm /> : <AddExtrasForm />}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        gap='20px'
        mb='20px'>
         <MiniStatistics
          startContent={<>

            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          </>
          }

          name='Total Admins'
          value={stats && stats.data.administrators}
        />

         <MiniStatistics
          startContent={<>

            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          </>
          }

          name='Total Staff'
          value={stats &&  stats.data.moderators}
        />

        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          }
          name='Total Students'
          value={stats && stats.data.students}
        />
       
      </SimpleGrid>
      <Heading as="h4" size="md" mb={3}>Welcome Moderator</Heading>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        gap='20px'
        mb='20px'>
        {/* <HSeparator/> */}

        <Button h="auto" onClick={() => { history.push("students") }} _hover={{
          bg: useColorModeValue("brand.500", "white"),
          // '& > svg': {
          transform: 'translateX(10px)',
          transition: 'transform 0.5s',
          // },


        }}>
          <MiniStatistics

            endContent={


              <IconBox

                w='56px'
                h='56px'
                bg={boxBg}
                icon={

                  <Icon w='32px' h='32px' as={MdArrowForward} color={brandColor} />
                }
              />
            }
            value='View Students'

          />
        </Button>


        <Button h="auto" onClick={()=>handleModal("term")} _hover={{
          bg: useColorModeValue("brand.500", "white"),
          // '& > svg': {
          transform: 'translateX(10px)',
          transition: 'transform 0.5s',
          // },


        }}>
          <MiniStatistics

            endContent={


              <IconBox

                w='56px'
                h='56px'
                bg={boxBg}
                icon={

                  <Icon w='32px' h='32px' as={MdArrowForward} color={brandColor} />
                }
              />
            }
            value='Update Term'
          />
        </Button>
        <Button h="auto" onClick={() => handleModal("grant")} _hover={{
          bg: useColorModeValue("brand.500", "white"),
          // '& > svg': {
          transform: 'translateX(10px)',
          transition: 'transform 0.5s',
          // },


        }}>
          <MiniStatistics

            endContent={


              <IconBox

                w='56px'
                h='56px'
                bg={boxBg}
                icon={

                  <Icon w='32px' h='32px' as={MdArrowForward} color={brandColor} />
                }
              />
            }
            value='GrantSheet Extras'
          />
        </Button>

      </SimpleGrid>
      <Heading as="h4" size="md" mb={3}>Staff Utils</Heading>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        gap='20px'
        mb='20px'>

        <Button h="auto" onClick={() => { history.push("staff") }} _hover={{
          bg: useColorModeValue("brand.500", "white"),
          transform: 'translateX(10px)',
          transition: 'transform 0.5s',


        }}>
          <MiniStatistics

            endContent={


              <IconBox

                w='56px'
                h='56px'
                bg={boxBg}
                icon={

                  <Icon w='32px' h='32px' as={MdArrowForward} color={brandColor} />
                }
              />
            }
            value='View Staff'
          />
        </Button>

        <Button h="auto" _hover={{
          bg: useColorModeValue("brand.500", "white"),
          transform: 'translateX(10px)',
          transition: 'transform 0.5s',


        }}>
          <MiniStatistics

            endContent={


              <IconBox

                w='56px'
                h='56px'
                bg={boxBg}
                icon={

                  <Icon w='32px' h='32px' as={MdArrowForward} color={brandColor} />
                }
              />
            }
            value='View Analytics'
          />
        </Button>



      </SimpleGrid>

      {/* <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap='20px' mb='20px'>
        <CheckTable columnsData={columnsDataCheck} tableData={tableDataCheck} />
        <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px'>
          <DailyTraffic />
          <PieCard />
        </SimpleGrid>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap='20px' mb='20px'>
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />
        <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px'>
          <Tasks />
          <MiniCalendar h='100%' minW='100%' selectRange={false} />
        </SimpleGrid> */}
      {/* </SimpleGrid> */}
    </Box>
  </>

  );
}























