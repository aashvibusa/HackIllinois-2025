import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  Spinner,
  Badge,
  useToast,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";

type Position = {
  symbol: string,
  qty: number,
  avgEntryPrice: number,
  currentPrice: number,
  marketValue: number,
  unrealizedPL: number,
  unrealizedPLPercent: number,
}

const PositionsList = () => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isClosing, setIsClosing] = useState<Record<string,boolean>>({});

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5001/api/positions");
      console.log(response.data);
      setPositions(response.data);
      setError(null);
    } catch (err) {
      setError((err as any).response?.data?.error || (err as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleClosePosition = async (symbol: any) => {
    try {
      setIsClosing((prev) => ({ ...prev, [symbol]: true }));
      await axios.delete(`http://localhost:5001/api/positions/${symbol}`);
      toast({
        title: "Position closed",
        description: `Successfully closed position for ${symbol}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh positions
      fetchPositions();
    } catch (err) {
      toast({
        title: "Error closing position",
        description: (err as any).response?.data?.error || (err as any).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsClosing((prev) => ({ ...prev, [symbol]: false }));
    }
  };

  const handleCloseAll = async () => {
    try {
      setIsLoading(true);
      await axios.delete("http://localhost:5001/api/positions");
      toast({
        title: "All positions closed",
        description: "Successfully closed all positions",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh positions
      fetchPositions();
    } catch (err) {
      toast({
        title: "Error closing positions",
        description: (err as any).response?.data?.error || (err as any).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={6}>
        <Text color="red.500">Error loading positions: {error}</Text>
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
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md"></Heading>
        {positions.length > 0 && (
          <Button colorScheme="red" size="sm" onClick={handleCloseAll}>
            Close All Positions
          </Button>
        )}
      </Flex>

      {positions.length === 0 ? (
        <Text></Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Symbol</Th>
              <Th isNumeric>Quantity</Th>
              <Th isNumeric>Avg. Price</Th>
              <Th isNumeric>Current Price</Th>
              <Th isNumeric>Market Value</Th>
              <Th isNumeric>P/L</Th>
              <Th isNumeric>% P/L</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {positions.map((position) => (
              <Tr key={position.symbol}>
                <Td>
                  <RouterLink to={`/stock/${position.symbol}`}>
                    <Text color="brand.500" fontWeight="bold">
                      {position.symbol}
                    </Text>
                  </RouterLink>
                </Td>
                <Td isNumeric>{Number(position.qty).toLocaleString()}</Td>
                <Td isNumeric>
                  $
                  {Number(position.avgEntryPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Td>
                <Td isNumeric>
                  $
                  {Number(position.currentPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Td>
                <Td isNumeric>
                  $
                  {Number(position.marketValue).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Td>
                <Td isNumeric>
                  <Text
                    color={
                      Number(position.unrealizedPL) >= 0
                        ? "green.500"
                        : "red.500"
                    }
                  >
                    $
                    {Number(position.unrealizedPL).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Badge
                    colorScheme={
                      Number(position.unrealizedPLPercent) >= 0 ? "green" : "red"
                    }
                  >
                    {(Number(position.unrealizedPLPercent) * 100).toFixed(2)}%
                  </Badge>
                </Td>
                <Td>
                  <Button
                    colorScheme="red"
                    size="xs"
                    isLoading={isClosing[position.symbol]}
                    onClick={() => handleClosePosition(position.symbol)}
                  >
                    Close
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default PositionsList;
