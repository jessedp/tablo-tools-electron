// @flow
import React from 'react';
// import React, { useState } from 'react';
import * as fsPath from 'path';
import InputGroup from 'react-bootstrap/InputGroup';
import Handlebars from 'handlebars';

// import TemplateEditor from './TemplateEditor';

// const helpers = require('template-helpers')();
// const sanitize = require('sanitize-filename');

export default function NamingTemplate(prop) {
  // const { label, value, data, airing, onClick, onChange, disabled } = prop;
  const { label, value, data } = prop;

  // const { value } = prop;
  // const [path, setPath] = useState(0);
  const path = '';

  if (!path) return <></>; //

  // const path = useState(value);
  let filledPath = path;

  const parts = path
    .toString()
    .split(fsPath.sep)
    .map(part => {
      const template = Handlebars.compile(part);
      try {
        return template(data);
      } catch (e) {
        // set part = value (above)
        console.warn('Handlebars unable to parse', e);
      }
      return part;
    });
  console.log(parts);
  filledPath = fsPath.join(parts);

  return (
    <div className="d-flex flex-row">
      <div>
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text title={label} style={{ width: '110px' }}>
              {label}
            </InputGroup.Text>
          </InputGroup.Prepend>

          <div className="name-preview border mt-1 p-1 bg-light">{value}</div>
          <div className="name-preview border mt-1 p-1 bg-light">
            {filledPath}
          </div>
        </InputGroup>
      </div>
    </div>
  );
}

// <TemplateEditor value={value} updateValue={setPath} />
