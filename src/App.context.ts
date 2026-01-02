import { createContext } from 'react';
import { Eye } from './models/Eye';

export const AppContext = createContext<{
  isAnimationEnabled: boolean;
  setIsAnimationEnabled: (isAnimationEnabled: boolean) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  selectedEye: Eye | null;
  selectEye: (eye: Eye | null) => void;
}>({
  isAnimationEnabled: false,
  setIsAnimationEnabled: () => {},
  isEditing: false,
  setIsEditing: () => {},
  selectedEye: null,
  selectEye: () => {},
});
