import styled from "styled-components";

interface ToggleButtonProps {
  checked: boolean;
}

export const StyledToggleButton = styled.button<ToggleButtonProps>`
  background-color: ${(props) => (props.checked ? "#fff" : "#000")};
  color: ${(props) => (props.checked ? "#000" : "#fff")};
  border: 1px solid ${(props) => (props.checked ? "#000" : "#fff")};
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
`;
