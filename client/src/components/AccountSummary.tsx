import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  SimpleGrid,
  Badge,
  Text,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";

type AccountData = {
  status?: string,
  portfolioValue?: number
  cash?: number,
  buyingPower?: number,
  daytradeCount?: number,
  equity?: number
}
const AccountSummary = ({accountData, isLoading}:{accountData: AccountData | null, isLoading: boolean}) => {
  const { colorMode } = useColorMode();
  // const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <Text color="red.500">Error loading account data: {error}</Text>
      </Box>
    );
  }

  if (!accountData) {
    return (
      <Box textAlign="center" py={6}>
        <Text color="gray.500">No account data available.</Text>
      </Box>
    );
  }

  return (
    <Box
      bg={colorMode === "dark" ? "gray.700" : "white"}
      p={4}
      borderRadius="lg"
      boxShadow="md"
      mb={4}
    >
      <Heading size="md" mb={4}></Heading>
      <Box mb={4}>
        <Badge colorScheme={accountData.status === "ACTIVE" ? "green" : "red"}>
          {accountData.status}
        </Badge>
      </Box>

      <StatGroup>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} width="100%">
          <Stat>
            <StatLabel>Portfolio Value</StatLabel>
            <StatNumber>
              $
              {Number(accountData.portfolioValue).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </StatNumber>
          </Stat>

          <Stat>
            <StatLabel>Cash</StatLabel>
            <StatNumber>
              $
              {Number(accountData.cash).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </StatNumber>
          </Stat>

          <Stat>
            <StatLabel>Buying Power</StatLabel>
            <StatNumber>
              $
              {Number(accountData.buyingPower).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </StatNumber>
          </Stat>
        </SimpleGrid>
      </StatGroup>

      <Divider my={4} />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Stat>
          <StatLabel>Equity</StatLabel>
          <StatNumber>
            $
            {Number(accountData.equity).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Daytrade Count</StatLabel>
          <StatNumber>{accountData.daytradeCount}</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default AccountSummary;
