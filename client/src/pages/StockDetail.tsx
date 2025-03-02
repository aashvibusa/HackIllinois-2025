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
  Text,
  Link,
  Divider,
  Badge,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import StockChart from "../components/StockChart";
import StockMetrics from "../components/StockMetrics";
import TradeForm from "../components/TradeForm";

import { Stock } from "../components/MarketOverview";

const StockDetail = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState<(Stock | null)>(null);
  const [timeframe, setTimeframe] = useState("1d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [yahooData, setYahooData] = useState<any>(null);
  const [yahooLoading, setYahooLoading] = useState(true);

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
        console.log("Stock data:", data);
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
    // const intervalId = setInterval(() => {
    //   fetchStockData();
    // }, 10000);

    // return () => clearInterval(intervalId);
  }, [symbol]);

  // Fetch Yahoo Finance data
  useEffect(() => {
    const fetchYahooData = async () => {
      setYahooLoading(true);
      try {
        // Fetch news
        console.log(`Fetching news for ${symbol}...`);
        const newsResponse = await fetch(
          `http://localhost:5001/api/stocks/${symbol}/news`
        );
        console.log(`News response status:`, newsResponse.status);
        if (!newsResponse.ok) {
          throw new Error(`Failed to fetch news for ${symbol}`);
        }
        const newsData = await newsResponse.json();
        console.log(`News data:`, newsData);
        setNewsData(Array.isArray(newsData) ? newsData.slice(0, 5) : []);

        // Fetch Yahoo-specific data
        console.log(`Fetching Yahoo data for ${symbol}...`);
        const yahooResponse = await fetch(
          `http://localhost:5001/api/stocks/${symbol}/yahoo`
        );
        console.log(`Yahoo response status:`, yahooResponse.status);
        if (!yahooResponse.ok) {
          throw new Error(`Failed to fetch Yahoo data for ${symbol}`);
        }
        const yahooData = await yahooResponse.json();
        console.log(`Yahoo data:`, yahooData);
        setYahooData(yahooData);
      } catch (err) {
        console.error("Error fetching Yahoo Finance data:", err);
      } finally {
        setYahooLoading(false);
      }
    };

    if (symbol) {
      fetchYahooData();
    }
  }, [symbol]);

  // Debug logs
  console.log("Current Yahoo data state:", yahooData);
  console.log("Current News data state:", newsData);
  console.log("Yahoo loading state:", yahooLoading);

  // const handleTimeframeChange = (newTimeframe: any) => {
  //   setTimeframe(newTimeframe);
  // };

  if (error) {
    return (
      <Alert status="error" borderRadius="md" m={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const yahooFinanceUrl = `https://finance.yahoo.com/quote/${symbol}`;

  return (
    <Box p={4} maxWidth="1400px" mx="auto">
      <Heading size="lg" mb={6}>
        {symbol} {stockData ? `- ${stockData.name}` : ""} {"($"}{stockData?.quote?.c ? (Math.floor(stockData.quote.c * 100) / 100).toFixed(2) : "0.00"}{" USD)"}
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
            {/* Chart content */}
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
            mb={6}
          >
            <Heading size="md" mb={4}>
              Stock Metrics
            </Heading>
            <StockMetrics data={stockData} isLoading={isLoading} />
          </Box>

          {/* Yahoo Finance Data */}
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={bgColor}
            borderColor={borderColor}
            mb={6}
          >
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Yahoo Finance Data</Heading>
              <Link href={yahooFinanceUrl} isExternal color="brand.500">
                View on Yahoo Finance <ExternalLinkIcon mx="2px" />
              </Link>
            </Flex>

            {yahooLoading ? (
              <Flex justifyContent="center" py={8}>
                <Spinner />
                <Text ml={3}>Loading Yahoo Finance data...</Text>
              </Flex>
            ) : yahooData && Object.keys(yahooData).length > 0 ? (
              <Box>
                {/* Yahoo Finance Stats */}
                <Box mb={6}>
                  <Heading size="sm" mb={3}>Key Statistics</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {yahooData.marketCap && (
                      <Box>
                        <Text fontWeight="bold">Market Cap</Text>
                        <Text>{formatLargeNumber(yahooData.marketCap)}</Text>
                      </Box>
                    )}
                    {yahooData.beta && (
                      <Box>
                        <Text fontWeight="bold">Beta</Text>
                        <Text>{formatNumber(yahooData.beta)}</Text>
                      </Box>
                    )}
                    {yahooData.pe && (
                      <Box>
                        <Text fontWeight="bold">P/E Ratio</Text>
                        <Text>{formatNumber(yahooData.pe)}</Text>
                      </Box>
                    )}
                    {yahooData.eps && (
                      <Box>
                        <Text fontWeight="bold">EPS (TTM)</Text>
                        <Text>${formatNumber(yahooData.eps)}</Text>
                      </Box>
                    )}
                    {yahooData.dividendYield && (
                      <Box>
                        <Text fontWeight="bold">Dividend Yield</Text>
                        <Text>{formatNumber(yahooData.dividendYield)}%</Text>
                      </Box>
                    )}
                    {yahooData.targetPrice && (
                      <Box>
                        <Text fontWeight="bold">Analyst Target</Text>
                        <Text>${formatNumber(yahooData.targetPrice)}</Text>
                      </Box>
                    )}
                  </SimpleGrid>
                </Box>

                {/* Yahoo Finance analyst recommendation */}
                {yahooData.recommendation && (
                  <Box mb={6}>
                    <Heading size="sm" mb={3}>Analyst Recommendation</Heading>
                    <Badge 
                      colorScheme={
                        yahooData.recommendation === 'Strong Buy' || yahooData.recommendation === 'Buy' ? 'green' :
                        yahooData.recommendation === 'Hold' ? 'yellow' : 'red'
                      }
                      fontSize="md"
                      px={2}
                      py={1}
                    >
                      {yahooData.recommendation}
                    </Badge>
                  </Box>
                )}

                {/* Recent news */}
                {newsData && newsData.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={3}>Recent News</Heading>
                    {newsData.map((item, index) => (
                      <Box key={index} mb={3} pb={3} borderBottomWidth={index < newsData.length - 1 ? "1px" : "0px"}>
                        <Link href={item.url} isExternal color="brand.500">
                          <Text fontWeight="bold">{item.headline || item.title}</Text>
                        </Link>
                        <Text fontSize="sm" color="gray.500">
                          {item.datetime ? new Date(item.datetime * 1000).toLocaleDateString() : new Date().toLocaleDateString()}
                        </Text>
                        <Text noOfLines={2}>{item.summary || item.description}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Text>No Yahoo Finance data available. Please check the console for errors.</Text>
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

// Helper functions for number formatting
const formatNumber = (num: number, decimals = 2) => {
  if (num === null || num === undefined) return "N/A";
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatLargeNumber = (num: number) => {
  if (num === null || num === undefined) return "N/A";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
};

export default StockDetail;