import { StyledToggleButton } from "./ToggleButton.styles";

export const ToggleButton = ({ onLabel, offLabel, onClick, checked }: { onLabel: string, offLabel: string, onClick: () => void, checked: boolean }) => {
  return (
    <StyledToggleButton onClick={onClick} checked={checked}>
      {checked ? onLabel : offLabel}
    </StyledToggleButton>
  )
};