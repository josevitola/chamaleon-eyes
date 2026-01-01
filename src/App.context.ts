import { createContext } from "react";

export const AppContext = createContext<{
  isAnimationEnabled: boolean;
  setIsAnimationEnabled: (isAnimationEnabled: boolean) => void;
  isDragAndDropEnabled: boolean;
  setIsDragAndDropEnabled: (isDragAndDropEnabled: boolean) => void;
}>({
  isAnimationEnabled: false,
  setIsAnimationEnabled: () => {},
  isDragAndDropEnabled: false,
  setIsDragAndDropEnabled: () => {},
});
