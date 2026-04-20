import { type PropsWithChildren } from 'react';

export interface ToastProps extends PropsWithChildren {
  title: string;
}

export const Toast = ({ title, children }: ToastProps): JSX.Element => {
  return (
    <div role="status" aria-live="polite">
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
};
