
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
import Students from "views/moderator/studentProfile/components/students";
import Moderators from "views/moderator/studentProfile/components/moderators";
import General from "views/admin/profile/components/General";
import Notifications from "views/admin/profile/components/Notifications";
// import Projects from "views/admin/profile/components/Projects";
// import Storage from "views/admin/profile/components/Storage";
import Upload from "views/admin/profile/components/Upload";
// import CheckTable from "../dataTables/components/CheckTable";
// Assets
import banner from "assets/img/auth/banner.png";
import React, { useEffect, useState } from "react";
import { useUserAuth } from "contexts/UserAuthContext";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { searchUser } from "api/apiService";
import Card from "components/card/Card";
import PieChart from "components/charts/PieChart";
import { getUserAttendance } from "api/apiService";
import { updateRemarks } from "api/apiService";
export default function Overview() {

  const [modalProp, setModalProp] = useState({})
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [data, setData] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { id, userType } = useParams();
  const { searchedProfile } = useUserAuth()
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
  if(data.length==0){
    return(<>Loading</>)
  }
  if(userType==="students"){
    return(
      <Students/>
    )
  }
  if(userType==="moderators"){
    return(
      <Moderators/>
    )
  }

  return (
    <>
    Please Wait
    </>

  );
}