import React, { ChangeEvent, Component } from 'react';
import styled from 'styled-components';

type Props = {
  checked?: number;
  label?: string;
  handleChange: any;
};
type State = {
  checked: boolean;
};
export const CHECKBOX_NATURAL = 0;
export const CHECKBOX_ON = 1;
export const CHECKBOX_OFF = 2;
export default class Checkbox extends Component<Props, State> {
  static defaultProps: {
    checked: number;
  };

  constructor(props: Props) {
    super(props);
    const { checked } = props;
    this.state = {
      checked: checked === CHECKBOX_ON,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { checked } = this.props;

    if (prevProps.checked !== checked) {
      this.toggle(checked);
    }
  }

  handleCheckboxChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    this.setState({
      checked,
    });
    const { handleChange } = this.props;
    handleChange(event.target);
  };

  toggle(force: number = CHECKBOX_NATURAL) {
    const { checked } = this.state;

    if (force === CHECKBOX_OFF) {
      this.setState({
        checked: false,
      });
    } else if (force === CHECKBOX_ON) {
      this.setState({
        checked: true,
      });
    } else {
      this.setState({
        checked: !checked,
      });
    }
  }

  render() {
    const { checked } = this.state;
    const { label } = this.props;
    return (
      <span>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label className="checkbox-wrap">
          <FullCheckbox
            checked={checked}
            onChange={this.handleCheckboxChange}
          />
          {label ? <span className="pl-2">{label}</span> : ''}
        </label>
      </span>
    );
  }
}
Checkbox.defaultProps = {
  checked: CHECKBOX_OFF,
};

// eslint-disable-next-line react/jsx-props-no-spreading,react/prop-types

interface FCProps {
  className?: string;
  checked?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}
function FullCheckbox(props: FCProps) {
  const { className, checked, onChange } = props;
  return (
    <CheckboxContainer className={className}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <HiddenCheckbox checked={checked} onChange={onChange} />
      <StyledCheckbox theme={checked}>
        <Icon viewBox="0 0 24 24">
          <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
        </Icon>
      </StyledCheckbox>
    </CheckboxContainer>
  );
}

FullCheckbox.defaultProps = {
  className: '',
  checked: false,
};

const CheckboxContainer = styled.span`
  display: inline-block;
  vertical-align: middle;
`;
const HiddenCheckbox = styled.input.attrs({
  type: 'checkbox',
})`
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
const StyledCheckbox = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 8px;
  border-width: 2px;
  border-style: solid;
  border-color: rgb(142, 140, 132);
  transition: all 150ms;
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px pink;
  }
  ${Icon} {
    visibility: ${(props) => (props.theme ? 'visible' : 'hidden')};
  }
`;
