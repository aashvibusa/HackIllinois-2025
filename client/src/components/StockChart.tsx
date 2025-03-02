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

type ChartData = {
  item: string,
  close: string,
  date: string
}

const StockChart = ({ symbol }: any) => {
  const { colorMode } = useColorMode();
  const [timeframe, setTimeframe] = useState("1m");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5001/api/stocks/${symbol}/chart`,
          {
            params: { timeframe },
          }
        );
        setChartData(response.data);
        setError(null);
      } catch (err) {
        setError((err as any).response?.data?.error || (err as any).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, timeframe]);

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
        <Text color="red.500">Error loading chart data: {error}</Text>
      </Box>
    );
  }

  if (!chartData || chartData.length === 0) {
    return <Box>No historical data available</Box>;
  }

  // Prepare chart data
  const dates = chartData.map((item) => item.date);
  const prices = chartData.map((item) => item.close);

  // Determine if the stock is trending up or down
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isPositive = lastPrice >= firstPrice;

  const data = {
    labels: dates,
    datasets: [
      {
        label: symbol,
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
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          {symbol}
        </Text>
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
      </Flex>

      <Box h="400px">
        <Line data={data} options={options as any} />
      </Box>
    </Box>
  );
};

export default StockChart;
