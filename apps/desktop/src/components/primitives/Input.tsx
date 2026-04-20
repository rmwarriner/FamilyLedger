import { type InputHTMLAttributes } from 'react';

export const Input = (props: InputHTMLAttributes<HTMLInputElement>): JSX.Element => {
  return <input {...props} />;
};
