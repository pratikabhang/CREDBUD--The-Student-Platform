import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, CircularProgressLabel, Flex } from '@chakra-ui/react';
import axios from 'axios';
import QRCodeGenerator from 'views/admin/default/components/QrCodeGenerator';

const TokenDisplay = () => {
    const [progress, setProgress] = useState(0);
    const [code, setCode] = useState(0);
    const [expirationTime, setExpirationTime] = useState(null);

    // Function to fetch token from API
    const fetchData = async () => {
        try {
            const response = await axios.get('https://localhost:1234/api/v1/token/get');
            const token = response.data.token;
            setCode(token.code);

            const timestamp = token.timestamp._seconds * 1000 + token.timestamp._nanoseconds / 1e6;
            const newExpirationTime = timestamp + 20000; // Token validity for 20 seconds
            setExpirationTime(newExpirationTime);
            console.log('Fetched Token:', token);
        } catch (error) {
            console.error('Error fetching token:', error.message);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Effect to update progress periodically and check token expiration
    useEffect(() => {
        if (!expirationTime) return;

        const interval = setInterval(() => {
            const currentTime = new Date().getTime();
            const timeDifference = expirationTime - currentTime;

            if (timeDifference <= 0) {
                // If expired, fetch new token
                fetchData();
            } else {
                const progressValue = Math.max(0, Math.min(100, (timeDifference / 20000) * 100));
                setProgress(progressValue);
            }
        }, 100); // Updates every 100ms

        return () => clearInterval(interval); // Cleanup on unmount
    }, [expirationTime]);

    return (
        <Flex alignItems='center'>
            <CircularProgress 
                value={progress} 
                size='720px' 
                thickness='4px'
                color="teal" 
                sx={{"& > div:first-child": { transitionProperty: "width" }}}>
                <CircularProgressLabel>{code}</CircularProgressLabel>
            </CircularProgress>
            <QRCodeGenerator data={code} />
        </Flex>
    );
};

export default TokenDisplay;
