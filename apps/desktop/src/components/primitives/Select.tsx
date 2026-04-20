import * as RadixSelect from '@radix-ui/react-select';
import { type PropsWithChildren } from 'react';

export const Select = ({ children }: PropsWithChildren): JSX.Element => {
  return <RadixSelect.Root>{children}</RadixSelect.Root>;
};
