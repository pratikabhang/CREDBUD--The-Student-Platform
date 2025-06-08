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
import Banner from "views/moderator/attendance/components/Banner";

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
  VStack,
  Input,
  Select,
} from "@chakra-ui/react";

import MiniStatistics from "components/card/MiniStatistics";

import banner from "assets/img/auth/banner.png";
// Assets

import ExcelReader from "components/fileUpload/exelUpload";
import { searchUser } from "api/apiService";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import Card from "components/card/Card";
import {
  MdImportExport,
  MdOutbond,
  MdQrCode2,
  MdOutlineFileDownload,
} from "react-icons/md";
import QRCode from "qrcode.react";
import { getCodes } from "api/apiService";

import { useUserAuth } from "contexts/UserAuthContext";

export default function Marketplace() {
  // Chakra Color Mode
  const [userData, setUserData] = useState();
  const { getUserProfile } = useUserAuth();
  useEffect(() => {
    getUserProfile().then((data) => {
      setUserData(data);
    });
  }, []);

  const QRCodeGenerator = () => {
    const [subject, setSubject] = useState("EL6");
    const [department, setDepartment] = useState("Computer");
    const [duration, setDuration] = useState(0);
    const [interval, setIntervalDuration] = useState(0);
    const [data, setData] = useState(null);
    const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
    const [currentCode, setCurrentCode] = useState(null);
    const { getUserProfile } = useUserAuth();
    const [userData, setUserData] = useState();

    useEffect(() => {
      getUserProfile().then((data) => {
        setUserData(data);
      });
    }, [getUserProfile]);

    const handleSubmit = async () => {
      const response = await getCodes({
        subject,
        department,
        duration,
        interval,
      });

      setData(response);
      setCurrentCode(response.codesArray[0]);
    };

    useEffect(() => {
      if (!data) return;

      let currentCodeIndex = 0;
      setCurrentCode(data.codesArray[currentCodeIndex]);

      const intervalId = setInterval(() => {
        currentCodeIndex += 1;
        if (currentCodeIndex < data.codesArray.length) {
          setCurrentCode(data.codesArray[currentCodeIndex]);
        } else {
          clearInterval(intervalId);
        }
      }, interval * 1000);

      return () => clearInterval(intervalId);
    }, [data, interval]);

    // useEffect(() => {
    //   if (!data) return;

    //   const updateCode = () => {
    //     const nextCodeIndex = currentCodeIndex + 1;
    //     if (nextCodeIndex < data.codesArray.length) {
    //       setCurrentCodeIndex(nextCodeIndex);
    //       setCurrentCode(data.codesArray[nextCodeIndex]);
    //     }
    //   };

    //   const intervalId = setInterval(updateCode, interval * 1000);
    //   return () => clearInterval(intervalId);
    // }, [currentCodeIndex, data, interval]);

    return (
      <VStack spacing={6} mt={10} align="center">
        {!data && userData && (
          <Box
            w="100%"
            maxW="md"
            p={6}
            borderWidth={1}
            borderRadius="md"
            boxShadow="md"
          >
            <Text fontSize="lg" mb={4} fontWeight="bold">
              Enter details to generate QR codes:
            </Text>
            <Box mb={4}>
              <Text mb={2}>Subject</Text>
              <Select
                onChange={(e) => setSubject(e.target.value)}
                defaultValue={subject}
                borderColor="purple.300"
              >
                {Object.keys(userData.subjectsAllocated).map((subjectKey) => (
                  <option value={subjectKey} key={subjectKey}>
                    {subjectKey}
                  </option>
                ))}
              </Select>
            </Box>
            <Box mb={4}>
              <Text mb={2}>Duration (in minutes)</Text>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="Enter duration"
                borderColor="purple.300"
              />
            </Box>
            <Box mb={4}>
              <Text mb={2}>Interval (in seconds)</Text>
              <Input
                type="number"
                value={interval}
                onChange={(e) => setIntervalDuration(Number(e.target.value))}
                placeholder="Enter interval"
                borderColor="purple.300"
              />
            </Box>
            <Button colorScheme="purple" onClick={handleSubmit} width="full">
              Generate QR Codes
            </Button>
          </Box>
        )}
        {data && currentCode && (
          <Box
            textAlign="center"
            p={6}
            borderWidth={1}
            borderRadius="md"
            boxShadow="md"
          >
            <QRCode
              value={`{"code":${currentCode.code},"qrId":"${data.department}","subject":"${subject}","department":"${userData.department}"}`}
              size={150}
            />
            <Text mt={4} fontSize="lg" fontWeight="bold">
              Current Code: {currentCode.code}
            </Text>
            <Text>
              Expires At:{" "}
              {new Intl.DateTimeFormat("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              }).format(new Date(currentCode.expiresIn._seconds * 1000))}
            </Text>
          </Box>
        )}
      </VStack>
    );
  };

  const VIPAttendance = () => {
    return <h1>HELLO</h1>;
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const [users, setUsers] = useState(null);
  const history = useHistory();
  const [modalType, setModalType] = useState(null);
  const handleModal = (modalType) => {
    setModalType(modalType);
    onOpen();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await searchUser("", "id", "moderators");
      setUsers(data);
      console.log(data);
    };
    fetchUserData();
  }, [setUsers, searchUser]);

  if (users == null) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <SkeletonText my="4" width="200px" noOfLines={1} skeletonHeight="6" />
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
          <Banner
            gridArea="1 / 1 / 2 / 2"
            name={<SkeletonText mt="4" noOfLines={1} skeletonHeight="4" />}
          />
          <Banner
            gridArea="1 / 1 / 2 / 2"
            name={<SkeletonText mt="4" noOfLines={1} skeletonHeight="4" />}
          />
          <Banner
            gridArea="1 / 1 / 2 / 2"
            name={<SkeletonText mt="4" noOfLines={1} skeletonHeight="4" />}
          />
          <Banner
            gridArea="1 / 1 / 2 / 2"
            name={<SkeletonText mt="4" noOfLines={1} skeletonHeight="4" />}
          />
          <Banner
            gridArea="1 / 1 / 2 / 2"
            name={<SkeletonText mt="4" noOfLines={1} skeletonHeight="4" />}
          />
          <Banner
            gridArea="1 / 1 / 2 / 2"
            name={<SkeletonText mt="4" noOfLines={1} skeletonHeight="4" />}
          />
          <Banner
            gridArea="1 / 1 / 2 / 2"
            name={<SkeletonText mt="4" noOfLines={1} skeletonHeight="4" />}
          />
          <Banner
            gridArea="1 / 1 / 2 / 2"
            name={<SkeletonText mt="4" noOfLines={1} skeletonHeight="4" />}
          />
        </Grid>
      </Box>
    );
  }
  return (
    <>
      <Modal onClose={onClose} size="full" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalType == "QR" ? <QRCodeGenerator /> : <VIPAttendance />}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Tabs
          variant="soft-rounded"
          justifyContent="right"
          colorScheme="brand.500"
        >
          <TabList>
            <Tab></Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
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
                <button onClick={() => handleModal("QR")}>
                  <Banner icon={<MdQrCode2 size="87px" />} name="Generate QR" />
                </button>
                <button onClick={() => handleModal("QR")}>
                  <Banner icon={<MdImportExport size="87px" />} name="Report" />
                </button>
                <button onClick={() => handleModal("QR")}>
                  <Banner
                    icon={<MdOutlineFileDownload size="87px" />}
                    name="Attendnace Analysis"
                  />
                </button>
                <button onClick={() => handleModal("QR")}>
                  <Banner
                    icon={<MdOutbond size="87px" />}
                    name="Export Attendance"
                  />
                </button>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
}
