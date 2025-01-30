import React, { useState } from "react";
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Text,
  DrawerContent,
  DrawerCloseButton,
  Avatar,
  Flex,
  Center,
  Input,
  useColorMode,
  Select,
  InputRightElement,
  InputGroup,
  CloseButton,
} from "@chakra-ui/react";
import { SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import axios from "axios";
import { Button, Icon, useDisclosure } from "@chakra-ui/react";
import { MdPalette, MdQrCodeScanner, MdArrowDropDown } from "react-icons/md";
import QRScannerSidebar from "./QRScannerSidebar";
import { searchUser } from "api/apiService";
import { useUserAuth } from "contexts/UserAuthContext";
import { NavLink, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Redirect, useLocation } from "react-router-dom/cjs/react-router-dom";

export function ThemeEditor(props) {
  const [searchData, setSearchData] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const [showScanner, setShowScanner] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const onNewScanResult = async (decodedText, decodedResult) => {
    // setData(decodedText);
    setShowScanner(false);
    
    const data = await searchUser(decodedText, "id", "students");
    setSearchData(data)
    setShowSearch(false);
    setIsSearching(false)
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("");
  const [userType, setUserType] = useState("students");
  const [isSearching, setIsSearching] = useState(false);
  const search = async () => {
    setShowSearch(false)
    setIsSearching(true)
    const data = await searchUser(searchQuery, searchField, userType);
    setSearchData(data)
    setIsSearching(false)
    // } catch (error) {
    //   console.log(error);
    // }
  };
  const { searchedProfile,setSearchedProfile } = useUserAuth();
  const history = useHistory();
  const handleViewProfile = (profile) => {
    setSearchedProfile(profile);
    history.push(`search/result/${userType}/${profile.id}`);
    
  };
  return (
    <>

      <Button
        variant="no-hover"
        bg="transparent"
        p="0px"
        minW="unset"
        minH="unset"
        h="18px"
        w="max-content"
        _focus={{ boxShadow: "none" }}
        ref={btnRef}
        onClick={onOpen}
      >
        <Icon
          me="10px"
          h="18px"
          w="18px"
          color={props.navbarIcon}
          as={MdQrCodeScanner}
        />
      </Button>
      <Drawer
        size="md"
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>

          <DrawerCloseButton />
          <DrawerHeader>QwikDrawer</DrawerHeader>
          {isSearching && <Progress w="100%" h="5px" isIndeterminate />}

          {/* <Button onClick={toggleColorMode} mb="4">
            Toggle {colorMode === "light" ? "Dark" : "Light"} Mode
          </Button> */}
          <DrawerBody>
            <>
              {showSearch ? <>           {showScanner && <QRScannerSidebar
                fps={10}
                qrbox={250}
                disableFlip={true}
                qrCodeSuccessCallback={onNewScanResult}
              />}
               

                <Flex direction="column" gap={4}>
                  <InputGroup size="md">
                    <Input
                      placeholder="Search"
                      h="44px"
                      boxShadow="0 0 1px black"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      borderEndRadius="none"
                    />
                    <InputRightElement width="4.5rem" h="44px" borderRadius="16px">
                      <Button h="1.75rem" size="sm" onClick={() => setShowScanner(!showScanner)} borderRadius="10px">
                        <Icon
                          h="18px"
                          w="18px"
                          color="brand.500"
                          as={MdQrCodeScanner}
                        />
                      </Button>
                    </InputRightElement>
                  </InputGroup>

                  <Flex gap={2}>
                    <Select onChange={(e) => setSearchField(e.target.value)}>
                      <option value=""></option>
                      <option value="id">ID</option>
                      <option value="name">NAME</option>
                      <option value="email">EMAIL</option>
                      <option value="number">MOBILE</option>
                      <option value="gradYear">GRAD YEAR</option>
                      <option value="department">DEPARTMENT</option>
                    </Select>
                    <Select onChange={(e) => setUserType(e.target.value)}>
                      <option value=""></option>
                      <option value="administrators">Administrator</option>
                      <option value="moderators">Moderator</option>
                      <option value="students">Student</option>
                    </Select>
                  </Flex>
                  <Button
                    w="unset"
                    h="44px"
                    mb="10px"
                    pl="6"
                    variant="brand"
                    borderStartRadius="1"
                    borderEndRadius="1"
                    onClick={search}
                  >
                    Search
                  </Button>
                </Flex>
                </>:

                <Flex
                  direction={"column"}
                  gap={4}
                  marginTop={10}
                  backgroundColor={""}
                  shadow={"medium"}
                >
                  <Button variant="outline" onClick={()=>{setShowSearch(true)}}>Search Again</Button>

                {searchData.length > 0 ? (
                  searchData.map((profile) => {
                    // console.log(profile);
                    return (
                      
                      <Box
                        borderColor={"black"}
                        borderWidth={1}
                        borderRadius={12}
                        padding={5}
                      >
                        <Flex direction={"column"} gap={4}>
                          <Flex
                            direction={"row"}
                            gap={4}
                            alignItems={"centers"}
                          >
                            <Avatar
                              _hover={{ cursor: 'pointer' }}
                              color="white"
                              name={profile.data.name}
                              bg="#11047A"
                              size="sm"
                              w="40px"
                              h="40px"
                            />
                            <Text fontSize="xl" as="b">
                              {profile.data.name}
                            </Text>
                          </Flex>

                          <Flex
                            direction="row"
                            style={{
                              flexWrap: "wrap",
                            }}
                            gap={4}
                          // marginLeft="12"
                          // paddingLeft="4"
                          >
                            <Text fontSize="md"> {profile.id}</Text>
                            <Text fontSize="md">
                              {" "}
                              {profile.data.department}
                            </Text>

                            <Flex gap="2">
                              <Text fontSize="md">
                                {" "}
                                {profile.data.contact}{" "}
                              </Text>{" "}
                              /
                              <Text fontSize="md">
                                {" "}
                                {profile.data.email}{" "}
                              </Text>
                            </Flex>
                          </Flex>
                          <Button
                            variant="brand"
                            borderStartRadius="1"
                            borderEndRadius="1"
                            onClick={()=>handleViewProfile(profile)}
                          >
                            View Profile
                          </Button>
                        
                                      {/* <NavLink key={profile.id} to={`search/result/${profile.id}`}>View Profile</NavLink> */}
                        </Flex>
                      </Box>
                    );
                  })
                ) : (
                  <Text>No Profile Found !!</Text>
                )}
              </Flex>
              }
            </>

          </DrawerBody>

          {/* <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue'>Save</Button>
          </DrawerFooter> */}
        </DrawerContent>
      </Drawer>
    </>
  );
}

function ThemeEditorButton({ onOpen, navbarIcon, ...rest }) {
  return (
    <Button
      variant="no-hover"
      bg="transparent"
      p="0px"
      minW="unset"
      minH="unset"
      h="18px"
      w="max-content"
      _focus={{ boxShadow: "none" }}
      onClick={onOpen}
      {...rest}
    >
      <Icon me="10px" h="18px" w="18px" color={navbarIcon} as={MdPalette} />
    </Button>
  );
}
{
  /* <Icon
                      ml="2"
                      h="18px"
                      w="18px"
                      color={props.navbarIcon}
                      as={MdArrowForward}
                    /> */
}
