// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Box, SimpleGrid, Heading, useColorModeValue } from "@chakra-ui/react";
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
    // Your existing useEffect code
    // ...
  }, []);

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
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
          <MarketOverview marketIndices={marketIndices} watchlistStocks={watchlistData} isLoading={isLoading}/>
        </Box>
      </SimpleGrid>

      {/* Positions Section */}
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
          Your Positions
        </Heading>
        <PositionsList/>
      </Box>

      {/* Market Trends Chart */}
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="md"
        bg={bgColor}
        borderColor={borderColor}
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
    </Box>
  );
};

export default Dashboard;