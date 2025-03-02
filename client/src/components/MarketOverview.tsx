import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Spinner,
  useColorMode
} from '@chakra-ui/react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

export type Index = {
  symbol: string,
  price: number,
  changePercent: number,
  change: number
}
export type Stock = {
  name: string,
  symbol: string,
  price: number,
  changePercent: number,
  change: number,
  quote: {
    c?: number
  }
}

const MarketOverview = ({marketIndices, watchlistStocks, isLoading}:{marketIndices: Index[] | null, watchlistStocks: Stock[] | null, isLoading:boolean}) => {
  const { colorMode } = useColorMode();
  // const [marketIndices, setMarketIndices] = useState<Index[]>([]);
  // const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchMarketData = async () => {
  //     try {
  //       // Fetch market indices
  //       const indicesResponse = await axios.get('http://localhost:5001/api/market/overview');
  //       setMarketIndices(Object.values(indicesResponse.data.indices));

  //       // Fetch watchlist stocks
  //       const watchlistResponse = await axios.get('http://localhost:5001/api/market/watchlist');
  //       setWatchlistStocks(watchlistResponse.data);
  //     } catch (err) {
  //       setError((err as any).response?.data?.error || (err as any).message);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchMarketData();
  // }, []);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">Error loading market data: {error}</Text>
      </Box>
    );
  }

  console.log(marketIndices);
  return (
    <Box>
      <Box 
        bg={colorMode === 'dark' ? 'gray.700' : 'white'} 
        p={4} 
        borderRadius="lg" 
        boxShadow="md"
        mb={4}
      >
        <Heading size="md" mb={4}>Market Indices</Heading>
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
            {marketIndices?.map((index, i) => (
              <Tr key={i}>
                <Td>{index.symbol}</Td>
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
          </Tbody>
        </Table>
      </Box>

      <Box 
        bg={colorMode === 'dark' ? 'gray.700' : 'white'} 
        p={4} 
        borderRadius="lg" 
        boxShadow="md"
      >
        <Heading size="md" mb={4}>Popular Stocks</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Symbol</Th>
              <Th>Company</Th>
              <Th isNumeric>Price</Th>
              <Th isNumeric>Change</Th>
              <Th isNumeric>% Change</Th>
            </Tr>
          </Thead>
          <Tbody>
            {watchlistStocks?.map((stock, i) => (
              <Tr key={i}>
                <Td>
                  <RouterLink to={`/stock/${stock.symbol}`}>
                    <Text color="brand.500" fontWeight="bold">
                      {stock.symbol}
                    </Text>
                  </RouterLink>
                </Td>
                <Td>{stock.name}</Td>
                <Td isNumeric>
                  {stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Td>
                <Td isNumeric>
                  <Text color={stock.change >= 0 ? 'green.500' : 'red.500'}>
                    {stock.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Badge colorScheme={stock.changePercent >= 0 ? 'green' : 'red'}>
                    {stock.changePercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default MarketOverview;