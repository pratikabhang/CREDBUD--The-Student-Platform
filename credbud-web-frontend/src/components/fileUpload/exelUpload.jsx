import {
    Table,
    Flex,
    Text,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    useColorModeValue, Button,
    Input,
    Grid,
    Progress,
    Box
} from "@chakra-ui/react"
import { uploadData } from "api/apiService";
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
// import Upload from "views/admin/profile/components/Upload";

const ExcelReader = ({type}) => {
    
    // const textColor = useColorModeValue("gray.700", "white")
    const bgColor = useColorModeValue("white", "gray.700")
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const [excelData, setExcelData] = useState([]);
    const [jsonExcelData, setJsonExcelData] = useState([]);
    // let mainText = useColorModeValue('navy.700', 'white');
    // let secondaryText = useColorModeValue('gray.700', 'white');
    // const handleFile = (file) => {
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //         const data = new Uint8Array(e.target.result);
    //         const workbook = XLSX.read(data, { type: 'array' });
    //         const sheetName = workbook.SheetNames[0];
    //         const sheet = workbook.Sheets[sheetName];
    //         const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    //         console.log(jsonData)
    //         setExcelData(jsonData.slice(1)); // exclude header
    //     };
    //     reader.readAsArrayBuffer(file);
    // };
    const [headers, setHeaders] = useState([]);

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const headers = jsonData[0];
            setHeaders(headers)
            const rows = jsonData.slice(1);

            const formattedData = rows.map(row => {
                let obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });

            const finalJson = {
                "data": {
                    "type": type,
                    "users": formattedData
                }
            };
            // const marksJson = [
            //         {
            //           "studentId": "RTWYQ20",
            //           "subject": "DAA",
            //           "marks": 100,
            //           "assignmentNo": 2
            //         },
            //         {
            //           "studentId": "RTWYQ20",
            //           "subject": "DAA",
            //           "marks": 100,
            //           "assignmentNo": 2
            //         },

            //       ]

            console.log(finalJson);

            setExcelData(jsonData.slice(1)); // exclude header
            setJsonExcelData(finalJson); // exclude header
        };
        reader.readAsArrayBuffer(file);
    };
    const buttonBg = useColorModeValue("brand.500", "white");
    const buttonColor = useColorModeValue("white", "black");
    const buttonHoverBg = useColorModeValue("brand.600", "gray.200");
    const [isUploading, setIsUploading] = useState(false)
    const upload = async () => {
        setIsUploading(true)
        let resp=await uploadData(jsonExcelData)
        console.log(resp)
        setIsUploading(false)
    }
    return (
        <div>
            <Card
                direction='column'
                w='100%'
                px='0px'
                overflowX={{ sm: "scroll", lg: "hidden" }}>
                {/* {!isSearching && <Progress w="100%" h="5px" md="20px" isIndeterminate />} */}
                {isUploading && (
                    <Box w="100%" position="absolute" top="0" left="0" zIndex="1">
                        <Progress w="100%" h="5px" isIndeterminate />
                    </Box>
                )}
                {/* <Upload
                    gridArea={{
                        base: "3 / 1 / 4 / 2",
                        lg: "1 / 3 / 2 / 4",
                    }}
                    minH={{ base: "auto", lg: "420px", "2xl": "365px" }}
                    pe='20px'
                    pb={{ base: "100px", lg: "20px" }}
                /> */}
                <Flex px='25px' justify='space-between' mb='20px' align='center'>

                    <Text
                        color={textColor}
                        fontSize='22px'
                        fontWeight='700'
                        lineHeight='100%'>
                        Upload {type=="moderators"&&"Moderators"}{type=="administrators"&&"Administrators"}{type=="students"&&"Students"}
                    </Text>
                    <Flex px="25px" gap="25px">
                        <Button as="label" htmlFor="file-upload" bg={buttonBg}
                            color={buttonColor} w="200px" _hover={{ bg: useColorModeValue("brand.600", "gray.200") }}
                        >
                            {!excelData ? "Select another file" : "Select file"}
                        </Button>

                        <Input
                            id="file-upload"
                            type="file"
                            display="none"

                            onChange={(e) => handleFile(e.target.files[0])}
                        />
                        {excelData.length > 0 && (
                            <Button
                                as="label"
                                bg={buttonBg}
                                color={buttonColor}
                                w="200px"
                                onClick={upload}
                                _hover={{ bg: buttonHoverBg }}
                            >
                                Upload
                            </Button>
                        )}
                    </Flex>
                </Flex>

                {/* <input type="file" accept=".xlsx" onChange={(e) => handleFile(e.target.files[0])} /> */}
                <Table variant='simple' color={textColor} mb='24px' size="sm" overflowX="auto" mt="4">
                    <Thead >
                        <Tr>
                            {headers.map((header, index) => (
                                <Th key={index}>{header}</Th>
                            ))}
                        </Tr>

                        {/* <Tr  >
                            <Th>Roll Number</Th>
                            <Th>Name</Th>
                            <Th>Admission Year</Th>
                            <Th>Department</Th>
                            <Th>Email</Th>
                            <Th>Contact</Th>
                            <Th>Parents Contact</Th>
                        </Tr> */}
                    </Thead>
                    <Tbody>
                        {excelData.length > 0 &&
                            excelData.map((row, rowIndex) => {
                                // Skip rows with incomplete data (less than expected number of columns)
                                // if (row.length < 7) {
                                //     return null;
                                // }

                                return (
                                    <Tr key={rowIndex}>
                                        <Td>{row[0]}</Td>
                                        <Td>{row[1]}</Td>
                                        <Td>{row[2]}</Td>
                                        <Td>{row[3]}</Td>
                                        <Td>{row[4]}</Td>
                                        <Td>{row[5]}</Td>
                                        <Td>{row[6]}</Td>
                                        <Td>{row[7]}</Td>
                                        <Td>{row[8]}</Td>
                                        <Td>{row[9]}</Td>
                                    </Tr>
                                );
                            })}
                    </Tbody>
                    {/* <Tbody>
                            {jsonData.data.users.map((user, rowIndex) => (
                            <Tr key={rowIndex}>
                                {headers.map((header, colIndex) => (
                                    <Td key={colIndex}>{user[header]}</Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody> */}
                </Table>
            </Card>
        </div>
    );
};

export default ExcelReader;