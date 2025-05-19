import {createContext, useContext, useState} from 'react';

// Context per gestire lo stato di caricamento globale
const LoadingContext = createContext<{
  isUseLoading: boolean;
  setIsUseLoading: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// Hook custom per accedere al LoadingContext
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

/* -------------------------------------------------------------------- */

// Context per gestire lo stato di "refresh" globale
const RefreshingContext = createContext<{
  isUseRefreshing: boolean;
  setIsUseRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// Hook custom per accedere al RefreshingContext
export const useRefresh = () => {
  const context = useContext(RefreshingContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshingProvider');
  }
  return context;
};

/* -------------------------------------------------------------------- */

// Context per gestire lo stato di "applying" globale
const ApplyingContext = createContext<{
  isUseApplying: boolean;
  setIsUseApplying: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// Hook custom per accedere al ApplyingContext
export const useApply = () => {
  const context = useContext(ApplyingContext);
  if (!context) {
    throw new Error('useApplying must be used within a applyingProvider');
  }
  return context;
};

/* -------------------------------------------------------------------- */

// Context per gestire lo stato relativo all'IP
const IpContext = createContext<{
  isUseIp: boolean;
  setIsUseIp: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// Hook custom per accedere al IpContext
export const useIp = () => {
  const context = useContext(IpContext);
  if (!context) {
    throw new Error('useIp must be used within a IpProvider');
  }
  return context;
};

/* -------------------------------------------------------------------- */

// Provider che incapsula tutti i context e fornisce gli stati ai componenti figli
export const LoadingProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  // Stati globali per i vari context
  const [isUseRefreshing, setIsUseRefreshing] = useState(false);
  const [isUseLoading, setIsUseLoading] = useState(false);
  const [isUseApplying, setIsUseApplying] = useState(false);
  const [isUseIp, setIsUseIp] = useState(false);
  return (
    <LoadingContext.Provider value={{isUseLoading, setIsUseLoading}}>
      <RefreshingContext.Provider value={{isUseRefreshing, setIsUseRefreshing}}>
        <ApplyingContext.Provider value={{isUseApplying, setIsUseApplying}}>
          <IpContext.Provider value={{isUseIp, setIsUseIp}}>
            {children}
          </IpContext.Provider>
        </ApplyingContext.Provider>
      </RefreshingContext.Provider>
    </LoadingContext.Provider>
  );
};
