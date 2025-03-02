// src/components/Navbar.js
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Link,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
  IconButton,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import { SearchIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stock/${searchQuery.trim().toUpperCase()}`);
      setSearchQuery("");
    }
  };

  return (
    <Box
      bg={colorMode === "light" ? "brand.700" : "gray.800"}
      px={4}
      py={2}
      color="white"
      boxShadow="md"
    >
      <Flex alignItems="center" maxW="1200px" mx="auto">
        <Text fontSize="xl" fontWeight="bold" mr={8}>
          <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
            StockTrader
          </Link>
        </Text>

        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link
            as={RouterLink}
            to="/portfolio"
            _hover={{ textDecoration: "none" }}
          >
            Portfolio
          </Link>
          <Link
            as={RouterLink}
            to="/orders"
            _hover={{ textDecoration: "none" }}
          >
            Orders
          </Link>
        </HStack>

        <Spacer />

        <form onSubmit={handleSearch}>
          <InputGroup maxW="250px" mx={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search for a stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "black" : "white"}
              borderRadius="md"
            />
          </InputGroup>
        </form>

        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
        />
      </Flex>
    </Box>
  );
};

export default Navbar;
