import React, { useState, useEffect } from "react";
import { Box, Grid, Heading, Flex, useColorModeValue } from "@chakra-ui/react";
import AccountSummary from "../components/AccountSummary";
import MarketOverview, { Index, Stock } from "../components/MarketOverview";
import PositionsList from "../components/PositionsList";
import StockChart from "../components/StockChart";
import axios from "axios";

const Dashboard = () => {
  const [accountData, setAccountData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [watchlistData, setWatchlistData] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [marketIndices, setMarketIndices] = useState<Index[]>([]);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch account data
        const accountResponse = await fetch(
          "http://localhost:5001/api/account"
        );
        const accountJson = await accountResponse.json();

        // Fetch market overview data
        const marketResponse = await fetch(
          "http://localhost:5001/api/market/overview"
        );
        const marketJson = await marketResponse.json();

        // Fetch watchlist stocks - preset popular stocks
        const watchlistResponse = await fetch(
          "http://localhost:5001/api/market/watchlist"
        );
        const watchlistJson = await watchlistResponse.json();
        
        const indicesResponse = await axios.get('http://localhost:5001/api/market/overview');
        setMarketIndices(Object.values(indicesResponse.data.indices));

        setAccountData(accountJson);
        setMarketData(marketJson);
        setWatchlistData(watchlistJson);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up refresh interval (every 60 seconds)
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  
  return (
    <Box p={4} maxWidth="1400px" mx="auto">
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Account Summary Section */}
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Heading size="md" mb={4}>
            Account Summary
          </Heading>
          <AccountSummary accountData={accountData} isLoading={isLoading}/>
        </Box>

        {/* Market Overview Section */}
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Heading size="md" mb={4}>
            Market Overview
          </Heading>
          <MarketOverview marketIndices={marketIndices}  watchlistStocks={watchlistData} isLoading={isLoading}/>
        </Box>

        {/* Positions Section */}
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          bg={bgColor}
          borderColor={borderColor}
          gridColumn={{ lg: "span 2" }}
        >
          <Heading size="md" mb={4}>
            Your Positions
          </Heading>
          <PositionsList/>
          {/* <PositionsList positions={positions} isLoading={isLoading} /> */}
        </Box>

        {/* Market Trends Chart */}
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          bg={bgColor}
          borderColor={borderColor}
          gridColumn={{ lg: "span 2" }}
          height="400px"
        >
          <Heading size="md" mb={4}>
            Market Trends
          </Heading>
          {watchlistData && watchlistData.length > 0 && (
            <StockChart
              symbol={watchlistData[0].symbol}
              timeframe="1d"
              isLoading={isLoading}
            />
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default Dashboard;
