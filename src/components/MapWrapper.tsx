import { useEffect, useState } from "react";

interface MapWrapperProps {
  children: React.ReactNode;
}

export const MapWrapper = ({ children }: MapWrapperProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
};
