import { createContext } from 'react';
import { Eye } from './models/Eye';

export const AppContext = createContext<{
  isAnimationEnabled: boolean;
  setIsAnimationEnabled: (isAnimationEnabled: boolean) => void;
  isDebugEnabled: boolean;
  setDebugEnabled: (isDebugEnabled: boolean) => void;
  selectedEye: Eye | null;
  selectEye: (eye: Eye | null) => void;
}>({
  isAnimationEnabled: false,
  setIsAnimationEnabled: () => {},
  isDebugEnabled: false,
  setDebugEnabled: () => {},
  selectedEye: null,
  selectEye: () => {},
});
