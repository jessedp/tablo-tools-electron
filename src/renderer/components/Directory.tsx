import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

type Props = {
  label: string;
  value: string;
  onClick: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
};
export default function Directory(prop: Props) {
  const { label, value, onClick, onChange, disabled } = prop;
  const exists = window.fs.existsSync(value);
  return (
    <div className="d-flex flex-row">
      <div>
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text
              title={label}
              style={{
                width: '110px',
              }}
            >
              {label}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            value={value}
            placeholder={`Enter ${label}`}
            style={{
              width: '350px',
            }}
            onChange={onChange}
            disabled={disabled}
          />
          <InputGroup.Append>
            <Button
              size={'xs' as any}
              variant="outline-secondary"
              onClick={onClick}
              disabled={disabled}
              title="Select a Directory"
            >
              <span className="fa fa-folder-open" />
            </Button>
            {exists ? (
              <span className="smaller text-muted">
                <span className="fa fa-check-circle pt-2 pl-1 pr-1 text-success" />
                exists!
              </span>
            ) : (
              <span className="smaller text-muted">
                <span className="fa fa-exclamation-circle text-danger pt-2 pl-1 pr-1" />
                does not exist, will be auto-created
              </span>
            )}
          </InputGroup.Append>
        </InputGroup>
      </div>
    </div>
  );
}
