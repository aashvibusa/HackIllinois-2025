import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import StockChart from "../components/StockChart";
import StockMetrics from "../components/StockMetrics";
import TradeForm from "../components/TradeForm";

import { Stock } from "../components/MarketOverview";
import { s } from "framer-motion/dist/types.d-6pKw1mTI";

const StockDetail = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState<(Stock | null)>(null);
  const [timeframe, setTimeframe] = useState("1d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5001/api/stocks/${symbol}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${symbol}`);
        }
        const data = await response.json();
        console.log(data);
        setStockData(data);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setError((err as any).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();

    // Set up refresh interval (every 10 seconds during market hours)
    const intervalId = setInterval(() => {
      fetchStockData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [symbol]);

  const handleTimeframeChange = (newTimeframe: any) => {
    setTimeframe(newTimeframe);
  };

  if (error) {
    return (
      <Alert status="error" borderRadius="md" m={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={4} maxWidth="1400px" mx="auto">
      <Heading size="lg" mb={6}>
      {symbol} {stockData ? `- ${stockData.name}` : ""} {"($"}{stockData?.quote?.c ? (Math.floor(stockData.quote.c * 100) / 100).toFixed(2) : "0.00"}{" USD)"}
      <br></br>
      </Heading>

      <Grid templateColumns={{ base: "1fr", lg: "3fr 1fr" }} gap={6}>
        {/* Left Column */}
        <Box>
          {/* Chart Section */}
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={bgColor}
            borderColor={borderColor}
            mb={6}
            height="500px"
          >
            {/* <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Price Chart</Heading>
              <Tabs
                variant="solid-rounded"
                size="sm"
                onChange={(index) => {
                  const timeframes = ["1d", "1w", "1m", "3m", "1y"];
                  handleTimeframeChange(timeframes[index]);
                }}
              >
                <TabList>
                  <Tab>1D</Tab>
                  <Tab>1W</Tab>
                  <Tab>1M</Tab>
                  <Tab>3M</Tab>
                  <Tab>1Y</Tab>
                </TabList>
              </Tabs>
            </Flex> */}

            {isLoading && !stockData ? (
              <Flex justifyContent="center" alignItems="center" height="400px">
                <Spinner size="xl" />
              </Flex>
            ) : (
              <StockChart
                symbol={symbol}
                timeframe={timeframe}
                isLoading={isLoading}
              />
            )}
          </Box>

          {/* Stock Metrics Section */}
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={bgColor}
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>
              Stock Metrics
            </Heading>
            {isLoading && !stockData ? (
              <Flex justifyContent="center" alignItems="center" height="200px">
                <Spinner size="xl" />
              </Flex>
            ) : (
              <StockMetrics data={stockData} isLoading={isLoading} />
            )}
          </Box>
        </Box>

        {/* Right Column - Trade Form */}
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          bg={bgColor}
          borderColor={borderColor}
          height="fit-content"
          position={{ lg: "sticky" }}
          top={{ lg: "100px" }}
        >
          <Heading size="md" mb={4}>
            Trade {symbol}
          </Heading>
          <TradeForm
            symbol={symbol}
            currentPrice={stockData?.quote?.c}
            isLoading={isLoading}
          />
        </Box>
      </Grid>
    </Box>
  );
};

export default StockDetail;
