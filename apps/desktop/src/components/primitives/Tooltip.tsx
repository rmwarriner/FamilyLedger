import * as RadixTooltip from '@radix-ui/react-tooltip';
import { type PropsWithChildren } from 'react';

export const Tooltip = ({ children }: PropsWithChildren): JSX.Element => {
  return <RadixTooltip.Provider>{children}</RadixTooltip.Provider>;
};
