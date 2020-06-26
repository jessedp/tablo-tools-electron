// @flow
import React, { Component } from 'react';
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

import TemplateEditor from './TemplateEditor';
import NamingTemplateOptions from './NamingTemplateOptions';

import { buildTemplateVars, getTemplate } from '../utils/namingTpl';

import type NamingTemplateType from '../constants/app';

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

type Props = { label: string, type: string };
type State = {
  view: string,
  template: NamingTemplateType,
  templateVars: Array<Object>
};

export default class SettingsNaming extends Component<Props, State> {
  constructor() {
    super();
    this.state = { view: 'view', templateVars: [], template: {} };

    this.setView = this.setView.bind(this);
    this.updatePath = this.updatePath.bind(this);
  }

  async componentDidMount() {
    const { type } = this.props;
    const template = await getTemplate(type);
    const templateVars = await buildTemplateVars(type);
    // console.log(type, template);
    this.setState({ template, templateVars });
  }

  updatePath = (path: string) => {
    const { template } = this.state;
    template.template = path;
    this.setState({ template });
  };

  setView = (view: string) => {
    this.setState({ view });
  };

  render() {
    const { label, type } = this.props;
    const { view, template, templateVars } = this.state;

    if (!template || !template.template) return <></>; //

    let filledPath = template.template;

    const parts = template.template.split(fsPath.sep).map((part, idx) => {
      // console.log(part);
      const hbTemplate = Handlebars.compile(part);
      try {
        const tpl = hbTemplate(templateVars);
        if (idx === 0) return tpl;
        return sanitize(tpl);
      } catch (e) {
        console.warn('Handlebars unable to parse', e);
      }
      return part;
    });

    filledPath = fsPath.normalize(parts.join(fsPath.sep));

    return (
      <div className="mr-3 pb-4">
        <Row className="border-bottom bg-light p-1">
          <Col md="2" className="pt-1">
            <span className="pl-2 naming-tpl-header">{label}</span>
          </Col>
          <Col md="3" className="pt-1">
            {view === 'view' ? (
              <>
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => this.setView('edit')}
                >
                  edit
                </Button>
              </> //
            ) : (
              <div className="d-flex flex-row">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => this.setView('view')}
                >
                  cancel
                </Button>
                <Button
                  size="xs"
                  variant="success"
                  onClick={() => this.setView('view')}
                  className="ml-2"
                >
                  save
                </Button>
                Name:
              </div> //
            )}
          </Col>
          <Col>
            {view === 'view' ? (
              <div className="d-flex flex-row-reverse">
                <Button
                  size="xs"
                  variant="info"
                  onClick={() => this.setView('new')}
                  className="ml-2 float-right mt-1"
                >
                  new
                </Button>
                <NamingTemplateOptions type={type} />{' '}
              </div>
            ) : (
              ''
            )}
          </Col>
        </Row>

        <Row className="mt-2">
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
                  template={template}
                  data={templateVars}
                  updateValue={this.updatePath}
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
