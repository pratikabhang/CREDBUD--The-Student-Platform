/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useState, useEffect } from "react";
import Banner from "views/admin/profile/components/Banner";

// Chakra imports
import {
  Box,
  Button,
  Flex,
  Grid,
  Link,
  Text,
  useColorModeValue,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Icon,
  SkeletonText,
  TabList,
  Tabs,
  TabPanels,
  TabPanel,
  Heading,
  Tab,
} from "@chakra-ui/react";

import MiniStatistics from "components/card/MiniStatistics";

import banner from "assets/img/auth/banner.png";
// Assets

import ExcelReader from "components/fileUpload/exelUpload";
import { searchUser } from "api/apiService";
import { useHistory } from "react-router-dom/cjs/react-router-dom";

export default function Marketplace() {
  // Chakra Color Mode
  const { isOpen, onOpen, onClose } = useDisclosure()
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const [users, setUsers] = useState(null)
  const history = useHistory()
  const handleViewProfile = (profile) => {
    history.push(`search/result/moderators/${profile}`);
  };
  const renderGrid = () => (
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

        return (

          <div onClick={() => handleViewProfile(topic.id)}>
            <Banner
              key={topic.data.id}
              gridArea="1 / 1 / 2 / 2"
              banner={banner}
              avatar={topic.data.name}
              name={topic.data.name}
              post={topic.data.designation}
            />
          </div>
        );
      })}
    </Grid>
  );
  useEffect(() => {
    const fetchUserData = async () => {
      const data = await searchUser('', "id", "moderators")
      setUsers(data)
      console.log(data)
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
  return (
    <>
        <Modal onClose={onClose} size="full" isOpen={isOpen}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Staff Upload</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <ExcelReader type="moderators" />
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
          <Tabs variant="soft-rounded" justifyContent="right" colorScheme="brand.500">
              <Button onClick={onOpen}  colorScheme="blue" variant="solid" >
                Upload Staff Data
              </Button>
            <TabList>
              <Tab>
              </Tab>

            </TabList>

            <TabPanels>
              <TabPanel>
                {renderGrid()}
              </TabPanel>
              </TabPanels>
        </Tabs>
        </Box>
      </>
      );
}
