// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Box, SimpleGrid, Heading, useColorModeValue } from "@chakra-ui/react";
import axios from "axios";
import Recommended from "../components/Recommended";

const Recommendations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recs, setRecs] = useState<string[]>([]);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch account data
        const recsResponse = await axios.get('http://localhost:5001/api/recommendations');
        setRecs(recsResponse.data);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  },[])

  return (
    <Box>
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Heading size="md" mb={4}>
            Stock Recommendation
          </Heading>
          <Recommended tickers={recs} isLoading={isLoading}/>
        </Box>
    </Box>
  );
};

export default Recommendations;