import React from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  useColorMode,
} from "@chakra-ui/react";

const StockMetrics = ({ metrics }: any) => {
  const { colorMode } = useColorMode();

  // Extract data from metrics
  const quote = metrics.quote || {};
  const company = metrics.company || {};
  const stats = metrics.stats || {};

  // Calculate percent change from previous close to current price
  const previousClose = quote.pc || 0;
  const currentPrice = quote.c || 0;
  const percentChange = previousClose
    ? ((currentPrice - previousClose) / previousClose) * 100
    : 0;
  const isPositive = percentChange >= 0;

  // Format numbers
  const formatNumber = (num: number, decimals = 2) => {
    if (num === null || num === undefined) return "N/A";
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Format large numbers with abbreviations
  const formatLargeNumber = (num: number) => {
    if (num === null || num === undefined) return "N/A";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toString();
  };

  return (
    <Box
      bg={colorMode === "dark" ? "gray.700" : "white"}
      p={4}
      borderRadius="lg"
      boxShadow="md"
      mt={4}
    >
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Stat>
          <StatLabel>Current Price</StatLabel>
          <StatNumber>${formatNumber(currentPrice)}</StatNumber>
          <StatHelpText>
            <StatArrow type={isPositive ? "increase" : "decrease"} />
            {formatNumber(Math.abs(percentChange))}%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Previous Close</StatLabel>
          <StatNumber>${formatNumber(previousClose)}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Open</StatLabel>
          <StatNumber>${formatNumber(quote.o)}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Volume</StatLabel>
          <StatNumber>{formatLargeNumber(quote.v)}</StatNumber>
          <StatHelpText>Avg: {formatLargeNumber(stats.avgVolume)}</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Divider my={4} />

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Stat>
          <StatLabel>Market Cap</StatLabel>
          <StatNumber>${formatLargeNumber(company.marketCap)}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>P/E Ratio</StatLabel>
          <StatNumber>{formatNumber(stats.pe)}</StatNumber>
          <StatHelpText>Forward: {formatNumber(stats.forwardPE)}</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>52-Week Range</StatLabel>
          <StatHelpText>Low: ${formatNumber(stats["52weekLow"])}</StatHelpText>
          <StatHelpText>
            High: ${formatNumber(stats["52weekHigh"])}
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Dividend Yield</StatLabel>
          <StatNumber>{formatNumber(stats.dividendYield)}%</StatNumber>
        </Stat>
      </SimpleGrid>

      <Divider my={4} />

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        <Stat>
          <StatLabel>Day Range</StatLabel>
          <StatHelpText>Low: ${formatNumber(quote.l)}</StatHelpText>
          <StatHelpText>High: ${formatNumber(quote.h)}</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Beta</StatLabel>
          <StatNumber>{formatNumber(stats.beta)}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Analyst Recommendation</StatLabel>
          <StatNumber style={{ textTransform: "capitalize" }}>
            {stats.recommendation || "N/A"}
          </StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default StockMetrics;
