// src/components/Layout.tsx
import React from "react";
import { Grid, Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ChatbotPanel from "./ChatbotPanel";

const Layout = () => {
  return (
    <>
      <Navbar />
      <Grid
        templateColumns={{ base: "1fr", xl: "3fr 1fr" }}
        gap={6}
        p={4}
        maxWidth="1600px"
        mx="auto"
      >
        <Box>
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