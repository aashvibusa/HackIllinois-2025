// src/components/Layout.tsx
import React from "react";
import { Grid, Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ChatbotPanel from "./ChatbotPanel";
import { useLayout } from "../context/LayoutContext";

const Layout = () => {
  const { isChatbotCollapsed } = useLayout();

  return (
    <>
      <Navbar />
      
      <Grid
        templateColumns={{ 
          base: "1fr", 
          xl: isChatbotCollapsed ? "1fr 60px" : "3fr 1fr" 
        }}
        gap={6}
        p={4}
        maxWidth="1600px"
        mx="auto"
        minHeight="calc(100vh - 64px)" // Adding proper height for sticky behavior
        position="relative"
      >
        <Box>
          <Outlet />
        </Box>
        
        <Box 
            display={{ base: "none", xl: "block" }} 
            position="sticky" // Change from "relative" to "sticky"
            top="80px" // Add this to make it stick at the right position
            height="calc(100vh - 100px)" // Set a fixed height
            alignSelf="flex-start" // Add this to ensure proper sticking behavior
            >
          <ChatbotPanel />
        </Box>
      </Grid>
    </>
  );
};

export default Layout;