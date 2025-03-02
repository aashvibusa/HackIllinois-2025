import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Button,
  Flex,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import OrdersList, { Order } from "../components/OrdersList";

type Filter = "all" | "open" | "closed"

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const status =
          activeTab === 0
            ? "all"
            : activeTab === 1
            ? "open"
            : activeTab === 2
            ? "closed"
            : "all";

        const response = await fetch(`http://localhost:5001/api/orders?status=${status}`);
        const data = await response.json();

        console.log(data);
        // Ensure data is an array before setting it
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]); // Reset to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    // Set up refresh interval for open orders (every 15 seconds)
    const intervalId = setInterval(() => {
      if (activeTab === 0 || activeTab === 1) {
        fetchOrders();
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [activeTab]);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setIsLoading(true);
  };

  const filterOrders = (status: Filter): Order[] => {
    // Check if orders is defined and is an array
    if (!orders || !Array.isArray(orders)) {
      return [];
    }
    
    if (status === "all") return orders;
    return orders.filter((order) => {
      if (status === "open") {
        return [
          "new",
          "accepted",
          "pending_new",
          "accepted_for_bidding",
          "held",
          "partially_filled",
        ].includes(order.status);
      } else {
        return [
          "filled",
          "canceled",
          "expired",
          "rejected",
          "suspended",
          "done_for_day",
        ].includes(order.status);
      }
    });
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh orders after cancellation
        const updatedOrders = orders.map((order) =>
          order.id === orderId ? { ...order, status: "canceled" } : order
        );
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  return (
    <Box p={4} maxWidth="1400px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Order History</Heading>
        <Button as={Link} to="/portfolio" size="sm" colorScheme="brand">
          Back to Portfolio
        </Button>
      </Flex>

      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="md"
        bg={bgColor}
        borderColor={borderColor}
      >
        <Tabs variant="enclosed" onChange={handleTabChange}>
          <TabList mb={4}>
            <Tab>All Orders</Tab>
            <Tab>Open Orders</Tab>
            <Tab>Completed Orders</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <OrdersList
                orders={filterOrders("all")}
                isLoading={isLoading}
                onCancelOrder={cancelOrder}
              />
            </TabPanel>
            <TabPanel px={0}>
              <OrdersList
                orders={filterOrders("open")}
                isLoading={isLoading}
                onCancelOrder={cancelOrder}
              />
              {!isLoading && filterOrders("open").length === 0 && (
                <Flex
                  direction="column"
                  alignItems="center"
                  py={10}
                  textAlign="center"
                >
                  <Text fontSize="lg" mb={4}>
                    You don't have any open orders.
                  </Text>
                  <Button as={Link} to="/" colorScheme="brand">
                    Place New Order
                  </Button>
                </Flex>
              )}
            </TabPanel>
            <TabPanel px={0}>
              <OrdersList
                orders={filterOrders("closed")}
                isLoading={isLoading}
              />
              {!isLoading && filterOrders("closed").length === 0 && (
                <Flex
                  direction="column"
                  alignItems="center"
                  py={10}
                  textAlign="center"
                >
                  <Text fontSize="lg">No completed orders found.</Text>
                </Flex>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default Orders;