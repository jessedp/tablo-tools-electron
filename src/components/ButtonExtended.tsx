// import React from 'react';
// import Button, { ButtonProps } from 'react-bootstrap/Button';
import { ButtonProps } from 'react-bootstrap/Button';
import { BsPrefixRefForwardingComponent } from 'react-bootstrap/esm/helpers';

export type MyButtonProps = Omit<ButtonProps, 'size'> & {
  size?: 'sm' | 'lg' | 'xl' | '1000' | string;
};

// const ButtonExtended: React.FC<MyButtonProps> = ({
//   contents: any,
//   ...props
// }) => {
//   return <Button {...props}>{contents}</Button>;
// };

// export default ButtonExtended;

declare type ButtonExtendedType = BsPrefixRefForwardingComponent<
  'button',
  MyButtonProps
>;
declare const ButtonExtended: ButtonExtendedType;
export default ButtonExtended;
