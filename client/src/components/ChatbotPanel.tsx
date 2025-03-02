import React, { useState, useRef, useEffect } from "react";
import { Box, Heading, useColorMode, IconButton, Flex, Text, VStack } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, ChatIcon } from "@chakra-ui/icons";

type WidthType = { base: string; lg: string; xl: string } | string;

const ChatbotPanel = () => {
  const { colorMode } = useColorMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState<WidthType>({ base: "100%", lg: "400px", xl: "450px" });
  const [isDragging, setIsDragging] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const toggleCollapse = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setWidth({ base: "100%", lg: "400px", xl: "450px" });
    } else {
      setIsCollapsed(true);
      setWidth("60px");
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setInitialX(e.clientX);
    setInitialWidth(panelRef.current?.offsetWidth || 0);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = initialX - e.clientX;
      const newWidth = Math.max(200, Math.min(800, initialWidth + deltaX));
      setWidth(`${newWidth}px`);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, initialX, initialWidth]);

  return (
    <Flex position="relative">
      {/* Resize handle */}
      {!isCollapsed && (
        <Box
          position="absolute"
          left="-5px"
          top="0"
          width="10px"
          height="100%"
          cursor="ew-resize"
          zIndex="10"
          onMouseDown={startResize}
        />
      )}
      
      <Box
        ref={panelRef}
        bg={colorMode === "dark" ? "gray.700" : "white"}
        p={isCollapsed ? 2 : 4}
        borderRadius="lg"
        boxShadow="md"
        height="calc(100vh - 100px)"
        position="sticky"
        top="80px"
        overflow="hidden"
        width={width}
        maxWidth="100%"
        transition="all 0.3s ease"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent={isCollapsed ? "flex-start" : "flex-start"}
      >
        {isCollapsed ? (
          <VStack spacing={6} width="100%" alignItems="center" pt={4}>
            <ChatIcon boxSize={6} color={colorMode === "dark" ? "cyan.200" : "cyan.500"} />
            <IconButton
              aria-label="Expand panel"
              icon={<ChevronRightIcon />}
              onClick={toggleCollapse}
              size="sm"
              variant="ghost"
            />
            <Text
              transform="rotate(-90deg)"
              whiteSpace="nowrap"
              fontSize="sm"
              fontWeight="medium"
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              mt={10}
            >
              Finance Assistant
            </Text>
          </VStack>
        ) : (
          <>
            <Flex 
              justifyContent="space-between" 
              alignItems="center" 
              mb={4}
              width="100%"
            >
              <Heading size="md">Finance Assistant</Heading>
              <IconButton
                aria-label="Collapse panel"
                icon={<ChevronLeftIcon />}
                onClick={toggleCollapse}
                size="sm"
              />
            </Flex>
            
            <Box height="calc(100% - 20px)" borderRadius="md" overflow="hidden" flexGrow={1} width="100%">
              <iframe
                src="http://localhost:8501"
                width="100%"
                height="100%"
                style={{ border: "none", borderRadius: "8px" }}
                title="Finance Chatbot"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </Box>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default ChatbotPanel;