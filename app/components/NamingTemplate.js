// @flow
import React, { useState, useEffect } from 'react';
import * as fsPath from 'path';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import Handlebars from 'handlebars';

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

import deepFilter from '../utils/deepFilter';
import TemplateEditor from './TemplateEditor';
import Airing from '../utils/Airing';
import { SERIES, PROGRAM, MOVIE, EVENT } from '../constants/app';
import getConfig from '../utils/config';

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

const buildTemplateVars = async (type: number) => {
  const config = getConfig();
  const { episodePath, moviePath, eventPath, programPath } = config;

  const typeRe = new RegExp(`${type}`);
  const recData = await global.RecDb.asyncFindOne({ path: { $regex: typeRe } });
  const airing = await Airing.create(recData);

  const path = airing.typePath;
  const showRec = await global.ShowDb.asyncFindOne({ path });
  if (showRec) recData.show = showRec;

  const globalVars = {
    EXT: 'mp4',
    title: airing.title
  };

  let typeVars = {};
  switch (type) {
    case SERIES:
      typeVars = {
        episodePath,
        showTitle: airing.showTitle,
        seasonNum: airing.seasonNum,
        episodeNum: airing.episodeNum
      };
      break;

    case MOVIE:
      typeVars = {
        moviePath
      };
      break;
    case EVENT:
      typeVars = {
        eventPath
      };
      break;

    case PROGRAM:
    default:
      typeVars = { programPath };
  }

  // let result: Object = {};
  const result: Object = deepFilter(recData, (value: any, prop: any) => {
    // prop is an array index or an object key
    // subject is either an array or an object
    // console.log(value, prop, subject);
    if (prop && prop.toString().includes('path')) return false;
    if (prop && prop.toString().includes('error')) return false;
    if (prop && prop.toString().includes('warnings')) return false;
    if (prop && prop.toString().includes('_id')) return false;
    if (prop && prop.toString().includes('image')) return false;
    if (prop && prop.toString().includes('Image')) return false;
    if (prop && prop.toString().includes('user_info')) return false;
    if (prop && prop.toString().includes('qualifiers')) return false;

    return true;
  });

  return { ...globalVars, ...typeVars, ...result };
};

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
