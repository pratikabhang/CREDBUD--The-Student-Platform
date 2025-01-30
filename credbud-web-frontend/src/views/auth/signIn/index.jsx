import React, { useState } from "react";
import { NavLink } from "react-router-dom";
// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  Select,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Progress,
} from "@chakra-ui/react";
// Custom components
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useUserAuth } from "contexts/UserAuthContext";
// import {useNavigate} from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
function mapFirebaseErrorToText(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/invalid-credential":
      return "Incorrect Password.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/user-not-found":
      return "User not found. Please sign up.";
    case "auth/too-many-requests":
      return "Too many failure attempts please try again later.";
    // Add more cases for other error codes as needed
    default:
      return "An error occurred. Please try again.";
  }
}
function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue(
    { bg: "gray.200" },
    { bg: "whiteAlpha.300" }
  );
  const [error, setError] = useState(null);

  const googleActive = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.200" }
  );
  // const navigate=useNavigate();
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const [email, setEmail] = useState("gsn@mailnesia.com");
  const [userType, setUserType] = useState("");
  const [password, setPassword] = useState("rexor@9941");
  const [pst, setPst] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logIn, user } = useUserAuth();
  const history = useHistory();
  const handleSubmit = async () => {
    try {
      setLoading(true)
      await logIn(email, password, userType, pst);
      if(userType=="administrators"){
        history.push("/admin");
      }
      if(userType=="moderators"){
        history.push("/moderator");
      }
    } catch (e) {
      console.log(e);
      const errorMessage = mapFirebaseErrorToText(e.code);
      setError(errorMessage);
      setLoading(false)
    }
  };

  return (

    <>      {loading&&<Progress w="100%" h="5px" isIndeterminate />}
      <DefaultAuth illustrationBackground={illustration} image={illustration}>

        <Flex
          maxW={{ base: "100%", md: "max-content" }}
          w="100%"
          mx={{ base: "auto", lg: "0px" }}
          me="auto"
          h="100%"
          alignItems="start"
          justifyContent="center"
          mb={{ base: "30px", md: "60px" }}
          px={{ base: "25px", md: "0px" }}
          mt={{ base: "40px", md: "14vh" }}
          flexDirection="column"
        >

          <Box me="auto">
            <Heading color={textColor} fontSize="36px" mb="10px">
              Sign In
            </Heading>
            <Text
              mb="36px"
              ms="4px"
              color={textColorSecondary}
              fontWeight="400"
              fontSize="md"
            >
              Enter your email and password to sign in!
            </Text>
          </Box>
          <Flex
            zIndex="2"
            direction="column"
            w={{ base: "100%", md: "420px" }}
            maxW="100%"
            background="transparent"
            borderRadius="15px"
            mx={{ base: "auto", lg: "unset" }}
            me="auto"
            mb={{ base: "20px", md: "auto" }}
          >
            {/* <Button
            fontSize='sm'
            me='0px'
            mb='26px'
            py='15px'
            h='50px'
            borderRadius='16px'
            bg={googleBg}
            color={googleText}
            fontWeight='500'
            _hover={googleHover}
            _active={googleActive}
            _focus={googleActive}>
            <Icon as={FcGoogle} w='20px' h='20px' me='10px' />
            Sign in with Google
          </Button> */}
            {/* <Flex align='center' mb='25px'>
            <HSeparator />
            <Text color='gray.400' mx='14px'>
            or
            </Text>
            <HSeparator />
          </Flex> */}
            {error && (
              <Alert
                status="error"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                mb={4}
              >
                {/* <AlertIcon boxSize="40px" mr={0} /> */}
                {/* <AlertTitle mt={4} mb={1} fontSize="lg">
                 Error
               </AlertTitle> */}
                <AlertDescription maxWidth="sm">{error}</AlertDescription>
              </Alert>
            )}

            <FormControl>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Email<Text color={brandStars}>*</Text>
              </FormLabel>

              <Input
                isRequired={true}
                variant="auth"
                fontSize="sm"
                ms={{ base: "0px", md: "0px" }}
                type="email"
                placeholder="mail@institute.edu"
                mb="24px"
                fontWeight="500"
                size="lg"
                defaultValue={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired={true}
                  fontSize="sm"
                  placeholder="password"
                  mb="24px"
                  size="lg"
                  type={show ? "text" : "password"}
                  variant="auth"
                  defaultValue={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: "pointer" }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                User Type
              </FormLabel>
              <Select
                isRequired={true}
                onChange={(e) => {
                  // Use e.target.value to get the selected value
                  setUserType(e.target.value);
                }}
                variant="auth"
                fontSize="sm"
                colorScheme="brandScheme"
                color={textColorSecondary}
                ms={{ base: "0px", md: "0px" }}
                type="email"
                mb="24px"
                fontWeight="500"
                size="lg"
                placeholder="Select user type"
              >
                <option color={textColor} value="moderators">
                  Morderator
                </option>
                <option color={textColor} value="administrators">
                  Administrator
                </option>
                <option color={textColor} value="students">
                  Student
                </option>
              </Select>

              <Flex justifyContent="space-between" align="center" mb="24px">
                <FormControl display="flex" alignItems="center">
                  <Checkbox
                    id="remember-login"
                    colorScheme="brandScheme"
                    me="10px"
                    onClick={(e) => { setPst(e.target.value) }}
                  />
                  <FormLabel
                    htmlFor="remember-login"
                    mb="0"
                    fontWeight="normal"
                    color={textColor}
                    fontSize="sm"
                  >
                    Keep me logged in
                  </FormLabel>
                </FormControl>
                <NavLink to="/auth/forgot-password">
                  <Text
                    color={textColorBrand}
                    fontSize="sm"
                    w="124px"
                    fontWeight="500"
                  >
                    Forgot password?
                  </Text>
                </NavLink>
              </Flex>
              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
                isLoading={loading}
                loadingText="Logging You In"
                // variant="outline"
                spinnerPlacement="end"
                onClick={handleSubmit}
              >
                Log In
              </Button>
            </FormControl>
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="start"
              maxW="100%"
              mt="0px"
            >
              <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                Not registered yet?
                <NavLink to="/register">
                  <Text
                    color={textColorBrand}
                    as="span"
                    ms="5px"
                    fontWeight="500"
                  >
                    Activate Your Account
                  </Text>
                </NavLink>
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </DefaultAuth>
    </>

  );
}


export default SignIn;
