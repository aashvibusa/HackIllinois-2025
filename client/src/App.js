import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import Portfolio from "./pages/Portfolio";
import Orders from "./pages/Orders";
import Layout from "./components/Layout";

// Extend the theme
const theme = extendTheme({
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#b3e0ff",
      500: "#0078d4",
      600: "#0067b8",
      700: "#004b87",
    },
    profit: {
      500: "#38A169",
    },
    loss: {
      500: "#E53E3E",
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stock/:symbol" element={<StockDetail />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;