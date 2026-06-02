"use client";

import React, { createContext, useContext } from "react";

type CurrencyContextType = {
  currencyCode: string;
  formatPrice: (price: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currencyCode: "USD",
  formatPrice: (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
});

export const CurrencyProvider = ({ children, currencyCode = "USD" }: { children: React.ReactNode, currencyCode?: string }) => {
  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(price);
    } catch (e) {
      return `$${price.toFixed(2)}`;
    }
  };
  
  return (
    <CurrencyContext.Provider value={{ currencyCode, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
