import { type ButtonHTMLAttributes } from 'react';

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element => {
  return <button {...props} />;
};
