import React from 'react';
import { CommonButtonProps } from 'react-bootstrap/Button';

import {
  BsPrefixPropsWithChildren,
  BsPrefixRefForwardingComponent,
} from 'react-bootstrap/esm/helpers';

import { MyButtonProps } from './ButtonExtended';

export interface DropdownToggleProps
  extends BsPrefixPropsWithChildren,
    MyButtonProps {
  split?: boolean;
  childBsPrefix?: string;
}

declare type DropdownToggle = BsPrefixRefForwardingComponent<
  'button',
  DropdownToggleProps
>;
export declare type PropsFromToggle = Partial<
  Pick<React.ComponentPropsWithRef<DropdownToggle>, CommonButtonProps>
>;
declare const MyDropdownToggle: DropdownToggle;
export default MyDropdownToggle;
