// @flow
import React, { useState, useEffect } from 'react';
import * as fsPath from 'path';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import Handlebars from 'handlebars';
import { buildTemplateVars } from '../utils/namingTpl';

// import SyntaxHighlighter from 'react-syntax-highlighter';
// import {
//   atomOneLight,
//   arduinoLight,
//   atelierLakesideLight,
//   atelierSulphurpoolLight,
//   docco,
//   foundation,
//   solarizedLight,
//   vs
// } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import TemplateEditor from './TemplateEditor';

const helpers = require('template-helpers')();
const sanitize = require('sanitize-filename');

helpers.lPad = (str: string, len: string | number, char: string | number) => {
  if (!str) return '';

  let length = 2;
  let filler = '0';
  if (typeof len === 'string' || typeof len === 'number') {
    length = parseInt(len, 10);
  }
  if (typeof char === 'string' || typeof char === 'number') {
    filler = `${char}`;
  }

  return str.toString().padStart(length, filler);
};

Handlebars.registerHelper(helpers);

type Props = { label: string, value: string, type: number };

export default function NamingTemplate(prop: Props) {
  const { label, value, type } = prop;

  const [templateVars: Object, setTemplateVars] = useState(null);

  useEffect(() => {
    if (!templateVars) {
      getTemplateVars(type);
    }
  }, []);

  const getTemplateVars = async (airingType: number) => {
    setTemplateVars(await buildTemplateVars(airingType));
  };

  const [path: string, setPath] = useState(value);

  const [view: string, setView] = useState('view');

  let filledPath = path;

  const parts = path.split(fsPath.sep).map((part, idx) => {
    // console.log(part);
    const template = Handlebars.compile(part);
    try {
      const tpl = template(templateVars);
      if (idx === 0) return tpl;
      return sanitize(tpl);
    } catch (e) {
      console.warn('Handlebars unable to parse', e);
    }
    return part;
  });

  filledPath = fsPath.normalize(parts.join(fsPath.sep));

  return (
    <div className="border mr-3 mb-3">
      <div className="naming-tpl-header border-bottom bg-light p-0 mb-1">
        <div className="p-1">
          <div className="d-inline-block" style={{ width: '150px' }}>
            <span className="pl-0">{label}</span>
          </div>

          <div className="d-inline-block">
            {view === 'view' ? (
              <Button
                size="xs"
                variant="primary"
                onClick={() => setView('edit')}
              >
                edit
              </Button>
            ) : (
              <div className="d-flex flex-row">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setView('view')}
                >
                  cancel
                </Button>

                <Button
                  size="xs"
                  variant="success"
                  onClick={() => setView('view')}
                  className="ml-2"
                >
                  save
                </Button>
              </div> //
            )}
          </div>
        </div>
      </div>

      <Row>
        <Col>
          <span className="ml-2 mr-2 fa fa-file" />

          <div className="name-preview border p-1">{filledPath}</div>
        </Col>
      </Row>
      {view === 'edit' ? (
        <Row className="mt-2">
          <Col className="">
            <div
              style={{ width: '30px', paddingLeft: '5px' }}
              className="d-inline-block border"
            >
              <span className=" fas fa-code" />
            </div>
            <div
              className="d-inline-block overflow-auto ml-1 pb-0 mb-0"
              style={{ width: '95%' }}
            >
              <TemplateEditor
                value={value}
                data={templateVars}
                updateValue={setPath}
              />
            </div>
          </Col>
        </Row>
      ) : (
        ''
      )}
    </div>
  );
}

// <Row className="mt-2">
// <Col className="">
//   <div
//     style={{ width: '30px', paddingLeft: '5px' }}
//     className="d-inline-block border"
//   >
//     <span className=" fas fa-code" />
//   </div>
//   <div
//     className="d-inline-block overflow-auto ml-1 pb-0 mb-0"
//     style={{ width: '95%' }}
//   >
//     {view === 'view' ? (
//       <SyntaxHighlighter
//         language="handlebars"
//         style={atelierSulphurpoolLight}
//         className="mb-0 pb-0 d-inline-block"
//       >
//         {value}
//       </SyntaxHighlighter>
//     ) : (
//       <TemplateEditor
//         value={value}
//         data={templateVars}
//         updateValue={setPath}
//       />
//     )}
//   </div>
// </Col>
// </Row>
