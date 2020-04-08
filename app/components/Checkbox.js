// @flow
import React, { Component } from 'react';

import styled from 'styled-components';

type Props = { checked?: number, handleChange: any };
type State = { checked: boolean };

export const CHECKBOX_NATURAL = 0;
export const CHECKBOX_ON = 1;
export const CHECKBOX_OFF = 2;

export default class Checkbox extends Component<Props, State> {
  props: Props;

  static defaultProps: { checked: number };

  constructor(props: Props) {
    super();
    const { checked } = props;
    this.state = { checked: checked === CHECKBOX_ON };
  }

  toggle(force: number = CHECKBOX_NATURAL) {
    const { checked } = this.state;
    if (force === CHECKBOX_OFF) {
      this.setState({ checked: false });
    } else if (force === CHECKBOX_ON) {
      this.setState({ checked: true });
    } else {
      this.setState({ checked: !checked });
    }
  }

  handleCheckboxChange = async (
    event: SyntheticInputEvent<HTMLInputElement>
  ) => {
    const { checked } = event.target;
    this.setState({ checked });
    const { handleChange } = this.props;
    handleChange(event.target);
  };

  render() {
    const { checked } = this.state;

    return (
      <div>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label>
          <FullCheckbox
            checked={checked}
            onChange={this.handleCheckboxChange}
          />
        </label>
      </div>
    );
  }
}
Checkbox.defaultProps = {
  checked: CHECKBOX_OFF
};

// eslint-disable-next-line react/jsx-props-no-spreading,react/prop-types
const FullCheckbox = ({ className, checked, ...props }) => (
  <CheckboxContainer className={className}>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <HiddenCheckbox checked={checked} {...props} />
    <StyledCheckbox checked={checked}>
      <Icon viewBox="0 0 24 24">
        <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
      </Icon>
    </StyledCheckbox>
  </CheckboxContainer>
);

FullCheckbox.defaultProps = {
  className: '',
  checked: false
};

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const Icon = styled.svg`
  fill: black;
  stroke: black;
  stroke-width: 1px;
  padding-bottom: 7px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${props => (props.checked ? 'white' : 'white')};
  border-radius: 8px;
  border-width: 2px;
  border-style: solid;
  border-color: rgb(142, 140, 132);
  transition: all 150ms;
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px pink;
  }
  ${Icon} {
    visibility: ${props => (props.checked ? 'visible' : 'hidden')};
  }
`;
