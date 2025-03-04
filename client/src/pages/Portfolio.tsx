import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Text,
  useColorModeValue,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import PositionsList from "../components/PositionsList";
import Chart from "../components/Chart";

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [historicalPerformance, setHistoricalPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        // Fetch portfolio summary
        const portfolioResponse = await fetch("http://localhost:5001/api/portfolio/summary");
        const portfolioJson = await portfolioResponse.json();
        console.log("Portfolio data:", portfolioJson);
        
        setPortfolioData(portfolioJson);

        // Fetch historical performance data
        const historyResponse = await fetch("http://localhost:5001/api/portfolio/history");
        const historyJson = await historyResponse.json();
        setHistoricalPerformance(historyJson);
        
        // You can also fetch positions here if needed
        // const positionsResponse = await fetch("http://localhost:5001/api/positions");
        // const positionsJson = await positionsResponse.json();
        // setPositions(positionsJson);
        
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();

    // Set up refresh interval (every 30 seconds)
    // const intervalId = setInterval(() => {
    //   fetchPortfolioData();
    // }, 30000);

    // return () => clearInterval(intervalId);
  }, []);

  const renderPortfolioStats = () => {
    if (isLoading || !portfolioData) {
      return (
        <Flex justifyContent="center" alignItems="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      );
    }

    // Safely access portfolio data properties with fallbacks
    const {
      portfolioValue = 0,
      dayChange = 0,
      dayChangeValue = 0,
      cashBalance = 0,
      buyingPower = 0,
      totalPnL = 0,
      totalPnLPercent = 0
    } = portfolioData || {};

    return (
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={6}
        my={6}
      >
        <Stat
          p={4}
          borderRadius="lg"
          bg={bgColor}
          shadow="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Total Portfolio Value</StatLabel>
          <StatNumber>
            ${parseFloat(portfolioValue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </StatNumber>
          <StatHelpText>
            <StatArrow
              type={dayChange >= 0 ? "increase" : "decrease"}
            />
            ${Math.abs(parseFloat(dayChangeValue)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (
            {parseFloat(dayChange).toFixed(2)}%) today
          </StatHelpText>
        </Stat>

        <Stat
          p={4}
          borderRadius="lg"
          bg={bgColor}
          shadow="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Cash Balance</StatLabel>
          <StatNumber>${parseFloat(cashBalance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</StatNumber>
          <StatHelpText>Buying Power: ${parseFloat(buyingPower).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</StatHelpText>
        </Stat>

        <Stat
          p={4}
          borderRadius="lg"
          bg={bgColor}
          shadow="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Total P/L</StatLabel>
          <StatNumber
            color={totalPnL >= 0 ? "profit.500" : "loss.500"}
          >
            ${parseFloat(totalPnL).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </StatNumber>
          <StatHelpText>
            <StatArrow
              type={totalPnL >= 0 ? "increase" : "decrease"}
            />
            {parseFloat(totalPnLPercent).toFixed(2)}% all time
          </StatHelpText>
        </Stat>
      </Grid>
    );
  };

  return (
    <Box p={4} maxWidth="1400px" mx="auto">
      <Heading size="lg" mb={4}>
        Your Portfolio
      </Heading>

      {renderPortfolioStats()}

      {/* Portfolio Performance Chart */}
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="md"
        bg={bgColor}
        borderColor={borderColor}
        mb={6}
        height="400px"
      >
        <Heading size="md" mb={4}>
          Portfolio Performance
        </Heading>
        {!isLoading && historicalPerformance && (
          <Box pt={2} height="320px">
            {/* Use StockChart component with portfolio performance data */}
            <Chart
              customData={historicalPerformance}
            />
          </Box>
        )}
      </Box>

      {/* Current Positions */}
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
          <Heading size="md">Current Positions</Heading>
          <Button as={Link} to="/orders" size="sm" colorScheme="brand">
            View Order History
          </Button>
        </Flex>

        <PositionsList />

        {!isLoading && positions.length === 0 && (
          <Flex
            direction="column"
            alignItems="center"
            py={10}
            textAlign="center"
          >
            <Text fontSize="lg" mb={4}>
              You don't have any open positions.
            </Text>
            <Button as={Link} to="/" colorScheme="brand">
              Explore Stocks
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default Portfolio;