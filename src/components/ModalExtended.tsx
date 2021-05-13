// import React from 'react';
// import Button, { ButtonProps } from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal';
import { ModalProps } from 'react-bootstrap/Modal';
import ModalBody from 'react-bootstrap/ModalBody';
import ModalDialog from 'react-bootstrap/ModalDialog';
import ModalFooter from 'react-bootstrap/ModalFooter';
import ModalHeader from 'react-bootstrap/ModalHeader';
import ModalTitle from 'react-bootstrap/ModalTitle';

import { BsPrefixRefForwardingComponent } from 'react-bootstrap/esm/helpers';

type MyModalProps = Omit<ModalProps, 'size'> & {
  size?: 'sm' | 'lg' | 'xl' | '1000' | string;
};

declare type ModalExtendedType = BsPrefixRefForwardingComponent<
  'div',
  MyModalProps
> & {
  Body: typeof ModalBody;
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Footer: typeof ModalFooter;
  Dialog: typeof ModalDialog;
  TRANSITION_DURATION: number;
  BACKDROP_TRANSITION_DURATION: number;
};

declare const ModalExtended: ModalExtendedType;
export default ModalExtended;
