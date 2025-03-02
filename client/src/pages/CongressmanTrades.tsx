import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Flex,
  Button,
  Badge,
  Spinner,
  Text,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  ButtonGroup,
  HStack,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";

interface TradeData {
  disclosure_date: string;
  transaction_date: string;
  representative: string;
  ticker: string;
  asset_description: string;
  type: string;
  amount: string;
  state: string;
  party: string;
  sector: string;
  industry: string;
}

interface ApiResponse {
  trades: TradeData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const CongressmanTrades: React.FC = () => {
  const [allTrades, setAllTrades] = useState<TradeData[]>([]);
  const [displayedTrades, setDisplayedTrades] = useState<TradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrades, setTotalTrades] = useState(0);
  const pageSize = 100;
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [tickerFilter, setTickerFilter] = useState("");
  const [tradeTypeFilter, setTradeTypeFilter] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  // Fetch data with pagination
  // Modify the fetchTrades function to include more debugging
const fetchTrades = useCallback(async (pageNumber: number) => {
    try {
      setLoadingMore(pageNumber > 1);
      if (pageNumber === 1) {
        setIsLoading(true);
      }
      
      console.log(`Attempting to fetch trades from API for page ${pageNumber}...`);
      // Include the pagination parameters
      const url = `http://localhost:5001/api/congressman-trades?page=${pageNumber}&page_size=${pageSize}`;
      console.log(`Request URL: ${url}`);
      
      const response = await axios.get(url);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      if (response.data && Array.isArray(response.data.trades)) {
        console.log(`Received ${response.data.trades.length} trades`);
        const newTrades = response.data.trades;
        setTotalTrades(response.data.total || 0);
        setTotalPages(response.data.total_pages || 1);
        
        if (pageNumber === 1) {
          setAllTrades(newTrades);
        } else {
          setAllTrades(prev => [...prev, ...newTrades]);
        }
        setError(null);
      } else {
        console.error('Invalid response structure:', response.data);
        // Check if the response is an array directly (not wrapped in a trades property)
        if (Array.isArray(response.data)) {
          console.log('Response is a direct array, adapting...');
          const newTrades = response.data;
          setTotalTrades(newTrades.length);
          setTotalPages(1); // No pagination info available
          
          if (pageNumber === 1) {
            setAllTrades(newTrades);
          } else {
            setAllTrades(prev => [...prev, ...newTrades]);
          }
          setError(null);
        } else {
          setError("Invalid response format from server");
          toast({
            title: "Error loading data",
            description: "Server returned an invalid response format",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (err: any) {
      console.error("Error fetching congressman trades:", err);
      console.error("Error details:", err.response || err.message);
      setError(`Failed to load congressman trade data: ${err.message}`);
      toast({
        title: "Error loading data",
        description: `Could not load congressman trade data: ${err.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [toast, pageSize]);

  // Initial load
  useEffect(() => {
    fetchTrades(1);
  }, [fetchTrades]);

  // Filter trades on the client side
  const filterTrades = useCallback(() => {
    if (!allTrades || allTrades.length === 0) {
      setDisplayedTrades([]);
      return;
    }
    
    let filtered = [...allTrades];

    if (nameFilter) {
      filtered = filtered.filter((trade) => 
        trade.representative && trade.representative.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (tickerFilter) {
      filtered = filtered.filter((trade) => 
        trade.ticker && trade.ticker.toLowerCase().includes(tickerFilter.toLowerCase())
      );
    }

    if (tradeTypeFilter) {
      filtered = filtered.filter((trade) => {
        if (!trade.type) return false;
        
        if (tradeTypeFilter === "buy") {
          return trade.type.toLowerCase().includes("purchase");
        } else if (tradeTypeFilter === "sell") {
          return trade.type.toLowerCase().includes("sale");
        }
        return true;
      });
    }

    if (partyFilter) {
      filtered = filtered.filter((trade) => 
        trade.party === partyFilter
      );
    }
    
    if (sectorFilter) {
      filtered = filtered.filter((trade) =>
        trade.sector && trade.sector.toLowerCase().includes(sectorFilter.toLowerCase())
      );
    }

    setDisplayedTrades(filtered);
  }, [allTrades, nameFilter, tickerFilter, tradeTypeFilter, partyFilter, sectorFilter]);

  // Apply filters whenever filter criteria or data changes
  useEffect(() => {
    filterTrades();
  }, [filterTrades]);

  // Debounced load more function for infinite scroll
  const loadMoreTrades = useCallback(() => {
    if (page < totalPages && !loadingMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTrades(nextPage);
    }
  }, [fetchTrades, page, totalPages, loadingMore, isLoading]);
  
  const debouncedLoadMore = useMemo(
    () => debounce(loadMoreTrades, 300),
    [loadMoreTrades]
  );

  // Handle scroll event for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        debouncedLoadMore();
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [debouncedLoadMore]);

  // Reset filters and reload data
  const resetFilters = () => {
    setNameFilter("");
    setTickerFilter("");
    setTradeTypeFilter("");
    setPartyFilter("");
    setSectorFilter("");
    setPage(1);
    fetchTrades(1);
  };

  const getTradeTypeBadge = (type: string | undefined) => {
    if (!type) return <Badge>Unknown</Badge>;
    
    if (type.toLowerCase().includes("purchase")) {
      return <Badge colorScheme="green">Buy</Badge>;
    } else if (type.toLowerCase().includes("sale")) {
      return <Badge colorScheme="red">Sell</Badge>;
    }
    return <Badge>{type}</Badge>;
  };

  const getPartyBadge = (party: string | undefined) => {
    if (!party) return <Badge>Unknown</Badge>;
    
    if (party === "Republican") {
      return <Badge colorScheme="red">{party}</Badge>;
    } else if (party === "Democrat") {
      return <Badge colorScheme="blue">{party}</Badge>;
    }
    return <Badge>{party}</Badge>;
  };
  
  // Manual pagination controls
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      fetchTrades(page + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      fetchTrades(page - 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading congressman trade data...</Text>
      </Box>
    );
  }

  if (error && (!allTrades || allTrades.length === 0)) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">{error}</Text>
        <Button mt={4} onClick={() => fetchTrades(1)}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={6}>Congressman Trading Activity</Heading>

      {/* Filters */}
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="md"
        bg={bgColor}
        borderColor={borderColor}
        mb={6}
      >
        <Heading size="md" mb={4}>
          Filter Trades
        </Heading>
        <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4} flexWrap="wrap">
          <FormControl flex="1">
            <FormLabel>Representative Name</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </InputGroup>
          </FormControl>

          <FormControl flex="1">
            <FormLabel>Ticker Symbol</FormLabel>
            <Input
              placeholder="Search by ticker"
              value={tickerFilter}
              onChange={(e) => setTickerFilter(e.target.value)}
            />
          </FormControl>

          <FormControl flex="1">
            <FormLabel>Trade Type</FormLabel>
            <Select
              placeholder="All trade types"
              value={tradeTypeFilter}
              onChange={(e) => setTradeTypeFilter(e.target.value)}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </Select>
          </FormControl>

          <FormControl flex="1">
            <FormLabel>Party</FormLabel>
            <Select
              placeholder="All parties"
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
            >
              <option value="Republican">Republican</option>
              <option value="Democrat">Democrat</option>
            </Select>
          </FormControl>
          
          <FormControl flex="1">
            <FormLabel>Sector</FormLabel>
            <Input
              placeholder="Search by sector"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
            />
          </FormControl>
        </Flex>
        <Button onClick={resetFilters} colorScheme="gray" size="sm">
          Reset Filters
        </Button>
      </Box>

      {/* Results count */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text>
          Showing {displayedTrades?.length || 0} filtered results from {allTrades?.length || 0} loaded trades (total: {totalTrades})
        </Text>
        
        <HStack>
          <IconButton
            aria-label="Previous page"
            icon={<ChevronLeftIcon />}
            onClick={goToPrevPage}
            isDisabled={page <= 1}
            size="sm"
          />
          <Text>
            Page {page} of {totalPages}
          </Text>
          <IconButton
            aria-label="Next page"
            icon={<ChevronRightIcon />}
            onClick={goToNextPage}
            isDisabled={page >= totalPages}
            size="sm"
          />
        </HStack>
      </Flex>

      {/* Table */}
      <Box
        shadow="md"
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
        overflowX="auto"
        mb={6}
      >
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Representative</Th>
              <Th>Party</Th>
              <Th>State</Th>
              <Th>Ticker</Th>
              <Th>Asset Description</Th>
              <Th>Sector</Th>
              <Th>Type</Th>
              <Th>Amount</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayedTrades && displayedTrades.map((trade, index) => (
              <Tr key={index}>
                <Td>{trade.transaction_date || "N/A"}</Td>
                <Td>{trade.representative || "N/A"}</Td>
                <Td>{getPartyBadge(trade.party)}</Td>
                <Td>{trade.state || "N/A"}</Td>
                <Td>
                  {trade.ticker ? (
                    <Link to={`/stock/${trade.ticker}`}>
                      <Text color="blue.500" fontWeight="bold">
                        {trade.ticker}
                      </Text>
                    </Link>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td>{trade.asset_description || "N/A"}</Td>
                <Td>{trade.sector || "—"}</Td>
                <Td>{getTradeTypeBadge(trade.type)}</Td>
                <Td>{trade.amount || "N/A"}</Td>
                <Td>
                  {trade.ticker && (
                    <Button
                      as={Link}
                      to={`/stock/${trade.ticker}`}
                      size="xs"
                      colorScheme="brand"
                    >
                      View Stock
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      
      {/* Loading indicator for infinite scroll */}
      {loadingMore && (
        <Flex justify="center" my={6}>
          <Spinner size="md" />
          <Text ml={3}>Loading more trades...</Text>
        </Flex>
      )}
      
      {/* Manual load more button as fallback */}
      {!isLoading && !loadingMore && page < totalPages && (
        <Button 
          onClick={() => loadMoreTrades()} 
          colorScheme="brand" 
          mx="auto" 
          display="block"
          mb={6}
        >
          Load More Trades
        </Button>
      )}
      
      {/* End of results message */}
      {page >= totalPages && (
        <Text textAlign="center" color="gray.500" mb={6}>
          End of results
        </Text>
      )}
    </Box>
  );
};

export default CongressmanTrades;