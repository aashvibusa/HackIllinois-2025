import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react"; // Correct import
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import Portfolio from "./pages/Portfolio";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";

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
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
