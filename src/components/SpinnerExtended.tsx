import { SpinnerProps } from 'react-bootstrap/Spinner';
// import { BsPrefixRefForwardingComponent } from 'react-bootstrap/esm/helpers';

type MySpinnerProps = Omit<SpinnerProps, 'size'> & {
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
};

// const ButtonExtended: React.FC<MyButtonProps> = ({
//   contents: any,
//   ...props
// }) => {
//   return <Button {...props}>{contents}</Button>;
// };

// export default ButtonExtended;
declare const SpinnerExtended: React.ForwardRefExoticComponent<
  MySpinnerProps & React.RefAttributes<unknown>
>;
export default SpinnerExtended;
