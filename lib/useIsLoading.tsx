import { createContext, useContext, useState } from "react";


const LoadingContext = createContext<{
  isUseLoading: boolean;
  setIsUseLoading: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isUseLoading, setIsUseLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{isUseLoading, setIsUseLoading}}>
      {children}
    </LoadingContext.Provider>
  );
};