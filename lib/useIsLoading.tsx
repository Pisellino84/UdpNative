import {createContext, useContext, useState} from 'react';

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

/* -------------------------------------------------------------------- */

const RefreshingContext = createContext<{
  isUseRefreshing: boolean;
  setIsUseRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const useRefresh = () => {
  const context = useContext(RefreshingContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshingProvider');
  }
  return context;
};

/* -------------------------------------------------------------------- */

const ApplyingContext = createContext<{
  isUseApplying: boolean;
  setIsUseApplying: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const useApply = () => {
  const context = useContext(ApplyingContext);
  if (!context) {
    throw new Error('useApplying must be used within a applyingProvider');
  }
  return context;
};

/* -------------------------------------------------------------------- */

const IpContext = createContext<{
  isUseIp: boolean;
  setIsUseIp: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const useIp = () => {
  const context = useContext(IpContext);
  if (!context) {
    throw new Error('useIp must be used within a IpProvider');
  }
  return context;
};


/* -------------------------------------------------------------------- */

export const LoadingProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [isUseRefreshing, setIsUseRefreshing] = useState(false);
  const [isUseLoading, setIsUseLoading] = useState(false);
  const [isUseApplying, setIsUseApplying] = useState(false);
  const [isUseIp, setIsUseIp] = useState(false)
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
