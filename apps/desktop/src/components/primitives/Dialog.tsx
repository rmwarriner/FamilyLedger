import * as RadixDialog from '@radix-ui/react-dialog';
import { type PropsWithChildren } from 'react';

export const Dialog = ({ children }: PropsWithChildren): JSX.Element => {
  return <RadixDialog.Root>{children}</RadixDialog.Root>;
};
