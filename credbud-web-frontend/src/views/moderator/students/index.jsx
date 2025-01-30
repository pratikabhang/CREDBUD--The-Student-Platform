
import { Avatar, Box, Grid, Heading, SimpleGrid, SkeletonCircle, SkeletonText,
  useDisclosure,
  Modal,useColorModeValue,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, Tabs, TabList, Tab, TabPanels, TabPanel, 
  Button} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Banner from "views/admin/profile/components/Banner";
import banner from "assets/img/auth/banner.png";
import { searchUser } from "api/apiService";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ExcelReader from "components/fileUpload/exelUpload";
export default function Settings() {
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const butCol=useColorModeValue("brand.200", "brand.500");
  const textCol=useColorModeValue("white", "white");
  const handleViewProfile = (profile) => {
    history.push(`search/result/students/${profile}`);
  };
  const renderGrid = (semesterRange) => (
    <Grid
      templateColumns={{
        base: "1fr",
        lg: "1.34fr 1.34fr 1.34fr 1.34fr",
      }}
      templateRows={{
        base: "repeat(3, 1fr)",
        lg: "1fr",
      }}
      gap={{ base: "20px", xl: "20px" }}
    >

      {users.map((topic) => {
        if (semesterRange.includes(topic.data.currentSem)) {
          return (
            
            <div onClick={()=>handleViewProfile(topic.id)}>
            <Banner
              key={topic.data.id}
              gridArea="1 / 1 / 2 / 2"
              banner={banner}
              avatar={topic.data.name}
              name={topic.data.name}
              post={getSemesterAbbreviation(topic.data.currentSem)}
              />
              </div>
          );
        }
        return null;
      })}
    </Grid>
  );
  function getSemesterAbbreviation(currentSemester) {
    let abbreviation;
    switch (currentSemester) {
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
  const [users, setUsers] = useState(null)
  useEffect(() => {
    const fetchUserData = async () => {
      const data = await searchUser('', "id", "students")
      setUsers(data)
    }
    fetchUserData()
  }, [setUsers, searchUser])
  if (users == null) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <SkeletonText my='4' width="200px" noOfLines={1} skeletonHeight='6' />
        <Grid
          templateColumns={{
            base: "1fr",
            lg: "1.34fr 1.34fr 1.34fr 1.34fr",
          }}
          templateRows={{
            base: "repeat(3, 1fr)",
            lg: "1fr",
          }}
          gap={{ base: "20px", xl: "20px" }}>
          <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={1} skeletonHeight='4' />} />
          <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={1} skeletonHeight='4' />} />
          <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={1} skeletonHeight='4' />} />
          <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={1} skeletonHeight='4' />} />
          <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={1} skeletonHeight='4' />} />
          <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={1} skeletonHeight='4' />} />
          <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={1} skeletonHeight='4' />} />
          <Banner gridArea='1 / 1 / 2 / 2' name={<SkeletonText mt='4' noOfLines={1} skeletonHeight='4' />} />
        </Grid>
      </Box>
    )
  }

  // Chakra Color Mode
  return (<>
    <Modal onClose={onClose} size="full" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New  Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ExcelReader type="students"/>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Tabs variant="soft-rounded"  colorScheme="brand.500">
        <TabList>
          <Tab>FE</Tab>
          <Tab>SE</Tab>
          <Tab>TE</Tab>
          <Tab>BE</Tab>
          {/* <Button onClick={onOpen}  colorScheme="blue" variant="solid" h="auto" _hover={{
        bg: butCol,
        color:textCol,
        transform: 'translateX(10px)',
        transition: 'transform 0.5s',
      }}>
        
        Upload Students Data
      </Button> */}
        </TabList>

        <TabPanels>
          <TabPanel>
            <Heading>FE</Heading>
            {renderGrid([1, 2])}
          </TabPanel>
          <TabPanel>
            <Heading>SE</Heading>
            {renderGrid([3, 4])}
          </TabPanel>
          <TabPanel>
            <Heading>TE</Heading>
            {renderGrid([5, 6])}
          </TabPanel>
          <TabPanel>
            <Heading>BE</Heading>
            {renderGrid([7, 8])}
          </TabPanel>
          
        </TabPanels>
      </Tabs>
  
    </Box>
    </>
  );
}


