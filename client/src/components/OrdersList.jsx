import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";

const OrdersList = () => {
  const { colorMode } = useColorMode();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/orders");
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
        <Text color="red.500">Error loading orders: {error}</Text>
      </Box>
    );
  }

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "filled":
        return "green";
      case "partially_filled":
        return "yellow";
      case "new":
      case "accepted":
        return "blue";
      case "pending_new":
        return "purple";
      case "rejected":
      case "canceled":
      case "expired":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box
      bg={colorMode === "dark" ? "gray.800" : "white"}
      p={5}
      shadow="md"
      borderRadius="lg"
    >
      <Heading size="lg" mb={6}>
        Orders
      </Heading>

      {orders.length === 0 ? (
        <Text textAlign="center" py={4}>
          No orders found
        </Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Order ID</Th>
                <Th>Symbol</Th>
                <Th>Side</Th>
                <Th>Quantity</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Created At</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td>#{order.id}</Td>
                  <Td>{order.symbol}</Td>
                  <Td>
                    <Badge
                      colorScheme={order.side === "buy" ? "green" : "red"}
                    >
                      {order.side}
                    </Badge>
                  </Td>
                  <Td>{order.qty}</Td>
                  <Td>{order.type}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </Td>
                  <Td>{formatDate(order.createdAt || order.created_at)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default OrdersList;