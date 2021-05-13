import React from 'react';
import DropdownItem from 'react-bootstrap/DropdownItem';
import DropdownMenu from 'react-bootstrap/DropdownMenu';

import {
  BsPrefixPropsWithChildren,
  BsPrefixRefForwardingComponent,
  SelectCallback,
} from 'react-bootstrap/esm/helpers';

import DropdownToggle from './ExtendedDropdownToggle';

declare const DropdownHeader: BsPrefixRefForwardingComponent<'div', unknown>;
declare const DropdownDivider: BsPrefixRefForwardingComponent<'div', unknown>;
declare const DropdownItemText: BsPrefixRefForwardingComponent<'span', unknown>;
export interface DropdownProps extends BsPrefixPropsWithChildren {
  drop?: 'up' | 'left' | 'right' | 'down';
  alignRight?: boolean;
  show?: boolean;
  flip?: boolean;
  onToggle?: (
    isOpen: boolean,
    event: React.SyntheticEvent<typeof Dropdown>,
    metadata: {
      source: 'select' | 'click' | 'rootClose' | 'keydown';
    }
  ) => void;
  focusFirstItemOnShow?: boolean | 'keyboard';
  onSelect?: SelectCallback;
  navbar?: boolean;
}
declare type ExtendedDropdown = BsPrefixRefForwardingComponent<
  'div',
  DropdownProps
> & {
  Toggle: typeof DropdownToggle;
  Menu: typeof DropdownMenu;
  Item: typeof DropdownItem;
  ItemText: typeof DropdownItemText;
  Divider: typeof DropdownDivider;
  Header: typeof DropdownHeader;
};

declare const Dropdown: ExtendedDropdown;
export default Dropdown;
