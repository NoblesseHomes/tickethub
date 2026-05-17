// src/context/FilterContext.js
"use client";

import { createContext, useContext } from "react";

// Создаем пустой контекст
const FilterContext = createContext(null);

export function FilterProvider({ children, value }) {
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext) ?? { uniqParams: null };
}
