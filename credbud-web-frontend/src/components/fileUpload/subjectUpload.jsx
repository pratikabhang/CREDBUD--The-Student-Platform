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
import { uploadSubjects } from "api/apiService";
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
// import Upload from "views/admin/profile/components/Upload";

const ExcelReader = ({ type }) => {

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
                    let cellValue = row[index];
                    console.log(cellValue)
                    if (cellValue === 'TRUE') cellValue = true;
                    if (cellValue === 'FALSE') cellValue = false;
                    obj[header] = cellValue;
                });
                return obj;
            });

            const finalJson =
                formattedData
                ;

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
        let resp = await uploadSubjects(jsonExcelData)
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

                <Flex px='25px' justify='space-between' mb='20px' align='center'>

                    <Text
                        color={textColor}
                        fontSize='22px'
                        fontWeight='700'
                        lineHeight='100%'>
                        Upload Subjects
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
                <div style={{ overflowX: 'auto' }}>
                <Table variant='simple' color={textColor} mb='24px' size="sm" overflowX="auto" mt="4">
                <Thead>
            <Tr>
              {headers.map((header, index) => (
                <Th key={index}>{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {excelData.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.map((cell,index)=>{
                    return(<Td>{cell}</Td>)
                })}
              </Tr>
            ))}
          </Tbody>

                </Table>
                </div>
            </Card>
        </div>
    );
};

export default ExcelReader;