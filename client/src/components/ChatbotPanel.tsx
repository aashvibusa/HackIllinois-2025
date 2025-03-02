import React from "react";
import { Box, Heading, useColorMode } from "@chakra-ui/react";

const ChatbotPanel = () => {
    const { colorMode } = useColorMode();
    
    return (
      <Box
        bg={colorMode === "dark" ? "gray.700" : "white"}
        p={4}
        borderRadius="lg"
        boxShadow="md"
        height="calc(100vh - 100px)"
        position="sticky"
        top="80px"
        overflow="hidden"
      >
        <Heading size="md" mb={4}>Finance Assistant</Heading>
        <Box height="calc(100% - 40px)" borderRadius="md" overflow="hidden">
          <iframe
            src="http://localhost:8501"
            width="100%"
            height="100%"
            style={{ border: "none", borderRadius: "8px" }}
            title="Finance Chatbot"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </Box>
      </Box>
    );
};

export default ChatbotPanel;