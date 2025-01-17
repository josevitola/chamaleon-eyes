import { ContainLevels } from '../classes/ControlBox';

export const DEFAULT_EYE_RADIUS = 30;

export const CONTAIN_LEVEL_TO_CURSOR: Record<ContainLevels, string> = {
  [ContainLevels.INNER_CONTAIN]: 'grab',
  [ContainLevels.MARGIN_CONTAIN]: 'col-resize',
  [ContainLevels.NO_CONTAIN]: 'default',
};
