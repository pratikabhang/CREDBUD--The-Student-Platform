import React, { useEffect, useState } from 'react';
import { Box, CircularProgress,CircularProgressLabel, Text ,Flex} from '@chakra-ui/react';
import axios from 'axios';
import QRCodeGenerator from 'views/admin/default/components/QrCodeGenerator';
const TokenDisplay = () => {
    const [rotation, setRotation] = useState(0);
    const [progress, setProgress] = useState(0);
    const[code,setCode]=useState(0);
    const [expirationTime, setExpirationTime] = useState(null);
  
    const fetchData = async () => {
      try {
        // Replace the URL with the actual endpoint to fetch the token
        const response = await axios.get('https://localhost:1234/api/v1/token/get');
        const token = response.data.token;
        // Extract timestamp and calculate expiration time
        setCode(token.code)
        const timestamp = token.timestamp._seconds * 1000 + token.timestamp._nanoseconds / 1e6;
        const expirationTime = timestamp + 20000; // 10 seconds validity
        setExpirationTime(expirationTime);
  
        // Use the token or perform any other actions as needed
        console.log('Fetched Token:', token);
      } catch (error) {
        console.error('Error fetching token:', error.message);
      }
    };
  
    const updateProgress = async () => {
      const currentTime = new Date().getTime();
      const timeDifference = expirationTime - currentTime;
  
      if (timeDifference <= 0) {
        // Token has expired, fetch a new one
        await fetchData();
      }
  
      const progressValue = Math.max(0, Math.min(100, (timeDifference / 20000) * 100)); // Cap at 100%
      const newRotation = `rotate(${progressValue * 1.8}deg)`;
  
      setRotation(newRotation);
      setProgress(progressValue);
      console.log(progressValue);
    };
  
    useEffect(() => {
      // Update the progress on component mount
      fetchData();
  
      // Set interval to update the progress every 100 milliseconds
      const interval = setInterval(() => {
        updateProgress();
      }, 100);
  
      // Clear interval on component unmount
      return () => clearInterval(interval);
    }, [expirationTime]);
  
    return (
        //   <Box
        //     className="progress-container"
        //     onClick={fetchData}
        //     w="250px"
        //     h="250px"
        //     position="relative"
        //     borderRadius="20px"
        //     backgroundColor="#fff"
        //     margin="-125px 0 0 -125px"
        //     border="2px solid #fff"
        //     left="50%"
        //     top="50%"
        //   >
        //     <Box
        //       className="progress-circle"
        //       aria-valuenow={progress}
        //       aria-valuemin="0"
        //       aria-valuemax="100"
        //       w="164px"
        //       h="164px"
        //       borderRadius="50%"
        //       backgroundColor="#F3F3F3"
        //       position="absolute"
        //       overflow="hidden"
        //       margin="-82px 0 0 -82px"
        //       transformOrigin="center"
        //       transform={rotation}
        //     >
        //       <span className="p-h"></span>
        //       <span className="p-f"></span>
        //       <Text
        //         id="progress"
        //         position="absolute"
        //         textAlign="center"
        //         lineHeight="140px"
        //         fontSize="34px"
        //         color="#46494D"
        //         backgroundColor="#fff"
        //         borderRadius="100%"
        //         height="140px"
        //         width="140px"
        //         zIndex="1"
        //         left="50%"
        //         top="50%"
        //         margin="-70px 0 0 -70px"
        //       >
        //         {progress.toFixed(2)}%
        //       </Text>
        //       <span className="sr-only">Complete</span>
        //     </Box>
        //   </Box>
        <Flex alignItems='center'>
            
            <CircularProgress value={progress} size='720px' thickness='4px' sx={{
                "& > div:first-child": {
                    transitionProperty: "width",
                },
            }} >
                <CircularProgressLabel>{code}</CircularProgressLabel>
            </CircularProgress>
            <QRCodeGenerator data={code}/>
            </Flex>

    );
};

export default TokenDisplay;