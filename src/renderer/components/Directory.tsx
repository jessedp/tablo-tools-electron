import React, { useState } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

type Props = {
  label: string;
  value: string;
  onClick: () => void;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement> | string,
    save?: boolean
  ) => void;
  disabled: boolean;
};

// there's probably a "better" way to track this... useMemo wasn't cutting it (and may recompute randomly)
let origValue: any;

export default function Directory(prop: Props) {
  const { label, value, onClick, onChange, disabled } = prop;
  const [dirty, setDirty] = useState(false);
  if (origValue === undefined) origValue = value;

  const changeField = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(
    //   `onChange: target = ${event.currentTarget.value}, origValue = ${origValue}, value=${value}`
    // );
    if (event.currentTarget.value === origValue) {
      setDirty(false);
    } else {
      setDirty(true);
    }

    onChange(event);
  };
  const saveField = () => {
    console.log(`before: origValue = ${origValue}, value=${value}`);
    origValue = value;
    onChange(value, true);
    setDirty(false);
    console.log(`after: origValue = ${origValue}, value=${value}`);
  };

  const resetField = () => {
    onChange(origValue);
    setDirty(false);
  };

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
            onChange={changeField}
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
          </InputGroup.Append>
          {dirty ? (
            <InputGroup.Append>
              <Button
                size={'xs' as any}
                variant="outline-success"
                onClick={() => saveField()}
                disabled={disabled}
                title="Save Path"
              >
                <span className="fa fa-save" />
              </Button>
              <Button
                size={'xs' as any}
                variant="outline-warning"
                onClick={() => resetField()}
                disabled={disabled}
                title="Undo Changes"
              >
                <span className="fa fa-undo" />
              </Button>
            </InputGroup.Append>
          ) : (
            ''
          )}

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
        </InputGroup>
      </div>
    </div>
  );
}
