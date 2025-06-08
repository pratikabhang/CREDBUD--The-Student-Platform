import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  VStack,
  useToast,
  Progress,
  Alert,
} from '@chakra-ui/react';
import axios from 'axios';

const RegistrationPage = () => {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [serverHash, setServerHash] = useState(null);
  const [formData, setFormData] = useState({
    studentNo: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  const handleChange =async (e) => {
    const { name, value } = e.target;
    if(name=='code' && value.length>3){
      try{
        setProcessing(true)
        const serverHash= await axios.post('https://localhost:1234/api/v1/token/verify',{"code":(value)})
        setServerHash(serverHash)
        setProcessing(false)
      }
      
      catch(error){
        console.log("ERROR")
        setProcessing(false)
      }
      
      
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Handle final step submission logic here
      // For this example, show a toast message
      // toast({
      //   title: 'Registration Successful',
      //   description: 'New student registered successfully!',
      //   status: 'success',
      //   duration: 5000,
      //   isClosable: true,
      // });

      // Clear the form data after successful registration
      setFormData({
        studentNo: '',
        firstName: '',
        lastName: '',
        email: '',
      });

      // Reset back to the first step
      setStep(1);
    }
  };

  return (
    <>
    <Box
      maxW="md"
      mx="auto"
      minH='xl'
      marginTop='12'
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
    >
    {processing?(
      <Progress size='xs' w="100%" isIndeterminate />
    ):null
    }
      <Box p={8}>

      <Heading mb={4} textAlign="center">
        Student Registration
      </Heading>
      <Progress mb={4} value={(step / 3) * 100} w="100%"/>
      <VStack spacing={4}>
        {step === 1 && (
          <FormControl>

            <FormLabel>Token Number</FormLabel>
            <Input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              variant="filled"
            />
          </FormControl>
        )}
        {step === 2 && (
          <>
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                variant="filled"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                variant="filled"
              />
            </FormControl>
          </>
        )}
        {step === 3 && (
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="filled"
            />
          </FormControl>
        )}
        <Button colorScheme="blue" onClick={handleNextStep} w="100%">
          {step < 3 ? 'Next' : 'Submit'}
        </Button>
      </VStack>
      </Box>

    </Box>
    </>

  );
};

export default RegistrationPage;
