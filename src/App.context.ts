import { createContext } from "react";

export const AppContext = createContext<{
  animation: boolean;
  setAnimation: (animation: boolean) => void;
  dragAndDrop: boolean;
  setDragAndDrop: (dragAndDrop: boolean) => void;
}>({
  animation: false,
  setAnimation: () => {},
  dragAndDrop: false,
  setDragAndDrop: () => {},
});
