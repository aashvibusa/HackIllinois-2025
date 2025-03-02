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
      >
        <Box 
          width="100%" 
          mx={isChatbotCollapsed ? "auto" : "0"}
          maxWidth={isChatbotCollapsed ? "1200px" : "none"}
        >
          <Outlet />
        </Box>
        <Box display={{ base: "none", xl: "block" }}>
          <ChatbotPanel />
        </Box>
      </Grid>
    </>
  );
};

export default Layout;