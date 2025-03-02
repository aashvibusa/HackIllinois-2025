import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  ButtonGroup,
  Button,
  useColorMode,
  Spinner,
} from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ customData }: {customData:any[]}) => {
  const { colorMode } = useColorMode();
    let loading = true
  const [error, setError] = useState(null);
    const [timeframe, setTimeframe] = useState("1m");

  if (error) {
    return (
      <Box textAlign="center" py={6}>
        <Text color="red.500">Error loading chart data: {error}</Text>
      </Box>
    );
  }

  if (!customData || customData?.length === 0) {
    return <Box>No historical data available</Box>;
  }

  // Prepare chart data
  console.log(customData, "WEW")
  const dates = customData?.map((item) => item.date);
  const prices = customData?.map((item) => item.value);

  // Determine if the stock is trending up or down
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isPositive = lastPrice >= firstPrice;

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Portfolio Value",
        data: prices,
        borderColor: isPositive ? "#38A169" : "#E53E3E",
        backgroundColor: isPositive
          ? "rgba(56, 161, 105, 0.2)"
          : "rgba(229, 62, 62, 0.2)",
        fill: "origin",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // Add this line
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: colorMode === "dark" ? "white" : "black",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: colorMode === "dark" ? "white" : "black",
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color:
            colorMode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        ticks: {
          color: colorMode === "dark" ? "white" : "black",
        },
        grid: {
          color:
            colorMode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <Box
      bg={colorMode === "dark" ? "gray.700" : "white"}
      p={4}
      borderRadius="lg"
      boxShadow="md"
      height="100%" // Add this line
    >
      <Flex justify="space-between" align="center" mb={4} height="10%">
        {/* <Text fontSize="xl" fontWeight="bold">
          {symbol || "Custom Data"}
        </Text> */}
        {!customData && (
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              onClick={() => setTimeframe("1d")}
              colorScheme={timeframe === "1d" ? "brand" : "gray"}
            >
              1D
            </Button>
            <Button
              onClick={() => setTimeframe("1w")}
              colorScheme={timeframe === "1w" ? "brand" : "gray"}
            >
              1W
            </Button>
            <Button
              onClick={() => setTimeframe("1m")}
              colorScheme={timeframe === "1m" ? "brand" : "gray"}
            >
              1M
            </Button>
            <Button
              onClick={() => setTimeframe("3m")}
              colorScheme={timeframe === "3m" ? "brand" : "gray"}
            >
              3M
            </Button>
            <Button
              onClick={() => setTimeframe("1y")}
              colorScheme={timeframe === "1y" ? "brand" : "gray"}
            >
              1Y
            </Button>
          </ButtonGroup>
        )}
      </Flex>

      <Box 
        height="90%" // Change from 400px to 90%
        width="100%" // Add this line
        position="relative" // Add this line
      >
        <Line data={data} options={options as any}           style={{ maxHeight: "100%" }}
        />
      </Box>
    </Box>
  );
};

export default Chart;