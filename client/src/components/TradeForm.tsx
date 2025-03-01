import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Heading,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";

const TradeForm = ({ symbol, currentPrice }: any) => {
  const { colorMode } = useColorMode();
  const toast = useToast();

  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [quantityType, setQuantityType] = useState("shares");
  const [quantity, setQuantity] = useState(1);
  const [dollars, setDollars] = useState(currentPrice || 100);
  const [limitPrice, setLimitPrice] = useState(currentPrice || 0);
  const [stopPrice, setStopPrice] = useState(
    currentPrice ? currentPrice * 0.95 : 0
  );
  const [timeInForce, setTimeInForce] = useState("day");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      let orderData = {
        symbol: symbol,
        side: side,
        type: orderType,
        timeInForce: timeInForce,
      } as any;

      // Set quantity or notional based on user choice
      if (quantityType === "shares") {
        orderData.qty = quantity;
      } else {
        orderData.notional = dollars;
      }

      // Add additional parameters based on order type
      if (orderType === "limit") {
        orderData.limitPrice = limitPrice;
      } else if (orderType === "stop") {
        orderData.stopPrice = stopPrice;
      } else if (orderType === "stop_limit") {
        orderData.stopPrice = stopPrice;
        orderData.limitPrice = limitPrice;
      }

      // Submit order
      const response = await axios.post(
        "http://localhost:5001/api/orders",
        orderData
      );

      toast({
        title: "Order placed successfully",
        description: `${side.toUpperCase()} ${
          orderData.qty || orderData.notional
        } of ${symbol}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setQuantity(1);
      setDollars(currentPrice || 100);
    } catch (error) {
      toast({
        title: "Error placing order",
        description: (error as any).response?.data?.error || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      bg={colorMode === "dark" ? "gray.700" : "white"}
      p={4}
      borderRadius="lg"
      boxShadow="md"
      mt={4}
    >
      <Heading size="md" mb={4}>
        Trade {symbol}
      </Heading>
      <form onSubmit={handleSubmit}>
        <RadioGroup onChange={setSide} value={side} mb={4}>
          <FormLabel>Order Side</FormLabel>
          <Stack direction="row">
            <Radio value="buy" colorScheme="green">
              Buy
            </Radio>
            <Radio value="sell" colorScheme="red">
              Sell
            </Radio>
          </Stack>
        </RadioGroup>

        <FormControl mb={4}>
          <FormLabel>Order Type</FormLabel>
          <Select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
            <option value="stop_limit">Stop Limit</option>
          </Select>
        </FormControl>

        <RadioGroup onChange={setQuantityType} value={quantityType} mb={4}>
          <FormLabel>Quantity Type</FormLabel>
          <Stack direction="row">
            <Radio value="shares">Shares</Radio>
            <Radio value="dollars">Dollars</Radio>
          </Stack>
        </RadioGroup>

        {quantityType === "shares" ? (
          <FormControl mb={4}>
            <FormLabel>Quantity (Shares)</FormLabel>
            <NumberInput
              min={1}
              value={quantity}
              onChange={(value) => setQuantity(Number(value))}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        ) : (
          <FormControl mb={4}>
            <FormLabel>Amount (USD)</FormLabel>
            <NumberInput
              min={1}
              value={dollars}
              onChange={(value) => setDollars(value)}
              precision={2}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        )}

        {(orderType === "limit" || orderType === "stop_limit") && (
          <FormControl mb={4}>
            <FormLabel>Limit Price</FormLabel>
            <NumberInput
              min={0.01}
              step={0.01}
              value={limitPrice}
              onChange={(value) => setLimitPrice(value)}
              precision={2}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        )}

        {(orderType === "stop" || orderType === "stop_limit") && (
          <FormControl mb={4}>
            <FormLabel>Stop Price</FormLabel>
            <NumberInput
              min={0.01}
              step={0.01}
              value={stopPrice}
              onChange={(value) => setStopPrice(Number(value))}
              precision={2}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        )}

        <FormControl mb={4}>
          <FormLabel>Time In Force</FormLabel>
          <Select
            value={timeInForce}
            onChange={(e) => setTimeInForce(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="gtc">Good Till Cancelled</option>
            <option value="ioc">Immediate or Cancel</option>
            <option value="fok">Fill or Kill</option>
          </Select>
        </FormControl>

        <Button
          colorScheme={side === "buy" ? "green" : "red"}
          type="submit"
          width="full"
          isLoading={isLoading}
        >
          {side === "buy" ? "Buy" : "Sell"} {symbol}
        </Button>
      </form>
    </Box>
  );
};

export default TradeForm;
