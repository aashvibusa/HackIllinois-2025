import {
    Box,
    Badge,
    Text,
    Spinner,
    useColorMode,
    Tr,
    Td,
    Table,
    Thead,
    Th,
    Tbody,
} from "@chakra-ui/react";
import { Index } from "./MarketOverview";
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';


const Recommended = ({ tickers }: { tickers: string[] | null, isLoading: boolean }) => {
    const { colorMode } = useColorMode();
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setIsLoading(true);
        const run = async () => {
            if (tickers === null || tickers === undefined) return;
            console.log(tickers, "tickers2")
            const data: any[] = [];
            for (const symbol of tickers) {
                const yahooResponse = await fetch(
                    `http://localhost:5001/api/recommendation-info/${symbol}`, {
                    headers: {
                        'Accept': 'application/json'  // Ensures JSON response
                    }
                });
                data.push(await yahooResponse.json());
            }

            setData(data);
            setIsLoading(false);
        }
        run();

    }, [tickers]);

    if (isLoading) {
        return (
            <Box textAlign="center" py={6}>
                <Spinner size="xl" />
            </Box>
        );
    }
    return (
        <Box
            bg={colorMode === "dark" ? "gray.700" : "white"}
            p={4}
            borderRadius="lg"
            boxShadow="md"
        >
            <Table variant="simple" size="sm">
                <Thead>
                    <Tr>
                        <Th>Index</Th>
                        <Th isNumeric>Price</Th>
                        <Th isNumeric>Change</Th>
                        <Th isNumeric>% Change</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data?.map((index, i) => (
                        <>
                            <Tr key={i}>
                                <Td>{index.info.symbol}</Td>
                                <Td>{index.info.longName}</Td>
                                <Td isNumeric>
                                    {index.info.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td isNumeric>
                                    <Text color={index.regularMarketChange >= 0 ? 'green.500' : 'red.500'}>
                                        {index.info.regularMarketChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Text>
                                </Td>
                                <Td isNumeric>
                                    <Badge colorScheme={index.regularMarketChangePercent >= 0 ? 'green' : 'red'}>
                                        {index.info.regularMarketChangePercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                    </Badge>
                                </Td>
                            </Tr>
                            <Tr key={`${i}-result`}>
                                <Td colSpan={5}>
                                    <Box borderTop="1px" borderColor="gray.200" pt={2}>
                                        {/* <pre style={{
                                            margin: 0,
                                            whiteSpace: "pre-wrap",      
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                            maxWidth: "100%"
                                        }}>
                                            {index.result}
                                        </pre> */}
                                        <ReactMarkdown>
                                            {index.result}
                                        </ReactMarkdown>
                                    </Box>
                                </Td>
                            </Tr>
                        </>
                    ))}
                </Tbody> */}
            </Table>
        </Box>
    );
}

export default Recommended;
