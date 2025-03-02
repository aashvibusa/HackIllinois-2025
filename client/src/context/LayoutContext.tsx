// Create a new file: src/context/LayoutContext.tsx
import React, { createContext, useState, useContext } from "react";

type LayoutContextType = {
  isChatbotCollapsed: boolean;
  setIsChatbotCollapsed: (value: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isChatbotCollapsed, setIsChatbotCollapsed] = useState(false);

  return (
    <LayoutContext.Provider value={{ isChatbotCollapsed, setIsChatbotCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};