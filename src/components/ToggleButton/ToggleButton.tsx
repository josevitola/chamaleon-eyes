import { StyledToggleButton } from './ToggleButton.styles';

interface ToggleButtonProps {
  onLabel: string;
  offLabel: string;
  onClick: () => void;
  checked: boolean;
}

export const ToggleButton = ({
  onLabel,
  offLabel,
  onClick,
  checked,
}: ToggleButtonProps) => {
  return (
    <StyledToggleButton onClick={onClick} checked={checked}>
      {checked ? onLabel : offLabel}
    </StyledToggleButton>
  );
};
