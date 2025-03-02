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

const Recommended = ({ tickers, isLoading }: { tickers: string[] | null, isLoading: boolean }) => {
    const { colorMode } = useColorMode();
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const run = async () => {
            if (tickers === null) return;
            const data: any[] = [];
            for (const symbol of tickers) {
                const yahooResponse = await fetch(
                    `http://localhost:5001/api/stocks/${symbol}/yahoo`);
                data.push(await yahooResponse.json());
            }

            setData(data);
        }
        run();
    }, []);

    console.log(data);
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
                {/* <Tbody>
                    {tickers?.map((index, i) => (
                        <Tr key={i}>
                            <Td isNumeric>
                                {index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Td>
                            <Td isNumeric>
                                <Text color={index.change >= 0 ? 'green.500' : 'red.500'}>
                                    {index.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Text>
                            </Td>
                            <Td isNumeric>
                                <Badge colorScheme={index.changePercent >= 0 ? 'green' : 'red'}>
                                    {index.changePercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                </Badge>
                            </Td>
                        </Tr>
                    ))}
                </Tbody> */}
            </Table>
        </Box>
    );
}

export default Recommended;
