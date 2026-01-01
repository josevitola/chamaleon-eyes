import { createContext } from "react";

export const AppContext = createContext<{
  isAnimationEnabled: boolean;
  setIsAnimationEnabled: (isAnimationEnabled: boolean) => void;
  isDebugEnabled: boolean;
  setDebugEnabled: (isDebugEnabled: boolean) => void;
}>({
  isAnimationEnabled: false,
  setIsAnimationEnabled: () => {},
  isDebugEnabled: false,
  setDebugEnabled: () => {},
});
