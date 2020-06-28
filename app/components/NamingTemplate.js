// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// import * as fsPath from 'path';

import * as slugify from 'slugify';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { InputGroup, Form, Alert } from 'react-bootstrap';

import Handlebars from 'handlebars';

import * as FlashActions from '../actions/flash';
import type { FlashRecordType } from '../reducers/types';

import TemplateEditor from './TemplateEditor';
import NamingTemplateOptions from './NamingTemplateOptions';
import { SERIES, PROGRAM, MOVIE, EVENT } from '../constants/app';

import {
  buildTemplateVars,
  getTemplate,
  getTemplateSlug,
  getDefaultTemplate,
  getDefaultTemplateSlug,
  newTemplate,
  upsertTemplate,
  isCurrentTemplate,
  fillTemplate
} from '../utils/namingTpl';

import type NamingTemplateType from '../constants/app';
import { setConfigItem } from '../utils/config';
import { titleCase } from '../utils/utils';
import Airing from '../utils/Airing';

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

type Props = {
  label: string,
  type: string,
  sendFlash: (message: FlashRecordType) => void
};
type State = {
  view: string,
  error: string,
  template: NamingTemplateType,
  templateVars: Object
};

class SettingsNaming extends Component<Props, State> {
  originalTemplate: NamingTemplateType;

  constructor() {
    super();
    this.state = { view: 'view', templateVars: [], template: {}, error: '' };

    this.setView = this.setView.bind(this);
    this.cancel = this.cancel.bind(this);
    this.new = this.new.bind(this);
    this.save = this.save.bind(this);
    this.setTemplate = this.setTemplate.bind(this);
    this.updateTemplate = this.updateTemplate.bind(this);
    this.updatePath = this.updatePath.bind(this);
    this.updateSlug = this.updateSlug.bind(this);
    this.updateLabel = this.updateLabel.bind(this);
    this.checkErrors = this.checkErrors.bind(this);
    this.setDefaultSlug = this.setDefaultSlug.bind(this);
  }

  async componentDidMount() {
    const { type } = this.props;
    const template = await getTemplate(type);
    this.originalTemplate = { ...template };

    const typeRe = new RegExp(type);
    const recData = await global.RecDb.asyncFindOne({
      path: { $regex: typeRe }
    });

    const airing = await Airing.create(recData, true);

    const templateVars = await buildTemplateVars(airing);

    this.setState({ template, templateVars });
    this.checkErrors();
  }

  checkErrors = async () => {
    const { type } = this.props;
    const { template } = this.state;
    if (!template) return;
    const { slug } = template;

    let error = '';
    if (slug === getDefaultTemplateSlug()) {
      error = 'cannot use default slug!';
      this.setState({ error });
      return true;
    }
    if (await global.NamingDb.asyncFindOne({ type, slug: template.slug })) {
      error = 'editing existing';
      // this.setState({ error });
    }

    this.setState({ error });

    return false;
  };

  updateTemplate = (template: NamingTemplateType) => {
    this.setState({ template });
  };

  setTemplate = (template: NamingTemplateType) => {
    const { type, sendFlash } = this.props;

    let nextTemplate = template;
    if (isCurrentTemplate(template)) {
      nextTemplate = getDefaultTemplate(template.type);
    }
    switch (type) {
      case SERIES:
        setConfigItem({ episodeTemplate: nextTemplate.slug });
        break;
      case MOVIE:
        setConfigItem({ movieTemplate: nextTemplate.slug });
        break;
      case EVENT:
        setConfigItem({ eventTemplate: nextTemplate.slug });
        break;
      case PROGRAM:
      default:
        setConfigItem({ programTemplate: nextTemplate.slug });
    }

    sendFlash({
      message: `${titleCase(nextTemplate.type)} default set to ${
        nextTemplate.label
      }`
    });
    this.originalTemplate = nextTemplate;
    this.setState({ template: nextTemplate });
  };

  updatePath = (path: string) => {
    if (!path) return;
    const { template } = this.state;

    console.log('updatePath', path, 'template', template);

    template.template = path || this.originalTemplate.template;
    this.setState({ template });
  };

  setDefaultSlug = () => {
    const { template } = this.state;
    if (!template.slug.trim()) {
      this.realUpdateSlug(template.label);
    }
  };

  updateSlug = (event: SyntheticEvent<HTMLInputElement>) => {
    this.realUpdateSlug(event.currentTarget.value);
  };

  realUpdateSlug(slug: string) {
    const { template } = this.state;

    template.slug = sanitize(
      slugify(slug, {
        lower: true,
        strict: true
      })
    );
    this.setState({ template, error: '' });
    this.checkErrors();
  }

  updateLabel = (event: SyntheticEvent<HTMLInputElement>) => {
    const { sendFlash } = this.props;
    const { template } = this.state;
    const val = event.currentTarget.value;
    if (val.length <= 100) {
      template.label = event.currentTarget.value;
      this.setState({ template });
    } else {
      sendFlash({
        message: 'Label must be <= 100 characters',
        type: 'warning'
      });
    }
  };

  cancel = () => {
    this.setState({ template: this.originalTemplate, view: 'view' });
  };

  new = () => {
    const { type } = this.props;
    const template = newTemplate(type);
    this.setState({ template, view: 'edit' });
  };

  save = async () => {
    const { sendFlash } = this.props;
    const { template } = this.state;
    let errors = await this.checkErrors();

    if (!errors) {
      errors = await upsertTemplate(template);
      if (errors) {
        sendFlash({ type: 'danger', message: errors.toString() });
      } else {
        sendFlash({ type: 'success', message: `saved "${template.label}"` });
        // change the select box!
        this.setState({
          view: 'view'
        });
      }
    }
  };

  setView = (view: string) => {
    this.setState({ view });
  };

  render() {
    const { label, type } = this.props;
    const { view, template, templateVars, error } = this.state;

    if (!template || !template.template) return <></>; //
    // let filledPath = template.template;

    // const parts = template.template.split(fsPath.sep).map(part => {
    //   const hbTemplate = Handlebars.compile(part, {
    //     noEscape: true,
    //     preventIndent: true
    //   });
    //   try {
    //     const tpl = hbTemplate({ ...templateVars[0], ...templateVars[1] });
    //     return tpl;
    //   } catch (e) {
    //     console.warn('Handlebars unable to parse', e);
    //   }
    //   return part;
    // });

    // filledPath = fsPath.normalize(parts.join(fsPath.sep));
    // const sanitizeParts = filledPath
    //   .split(fsPath.sep)
    //   .map(part => sanitize(part));
    // filledPath = fsPath.normalize(sanitizeParts.join(fsPath.sep));

    const filledPath = fillTemplate(template, templateVars);

    return (
      <div className="mb-3">
        <Row>
          <Col md="3">
            <Alert variant="dark" className="p-2 pl-3">
              <span className="pl-2 naming-tpl-header">{label}</span>
            </Alert>
          </Col>
          <Col md="5" className="mt-2">
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
              ''
            )}
            <div className="d-flex flex-row">
              {view !== 'view' ? (
                <Button size="xs" variant="light" onClick={this.cancel}>
                  cancel
                </Button>
              ) : (
                ''
              )}
              {view !== 'view' && getTemplateSlug(view) !== template.slug ? (
                <Button
                  size="xs"
                  variant="success"
                  onClick={this.save}
                  className="ml-2"
                >
                  save
                </Button>
              ) : (
                ''
              )}

              {view !== 'view' && error ? (
                <span className="smaller muted ml-2 text-white bg-warning p-1 pr-2 bolder">
                  {error}
                </span>
              ) : (
                ''
              )}
            </div>
          </Col>
          <Col className="mt-2">
            {view === 'view' ? (
              <div className="d-flex flex-row-reverse">
                <Button
                  size="xs"
                  variant="success"
                  onClick={this.new}
                  className="ml-2 float-right "
                >
                  new
                </Button>
                <NamingTemplateOptions
                  type={type}
                  updateTemplate={this.updateTemplate}
                  setTemplate={this.setTemplate}
                />{' '}
              </div>
            ) : (
              ''
            )}
          </Col>
        </Row>

        {view !== 'view' ? (
          <>
            <Row>
              <Col md="8">
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <InputGroup.Text title="Label">
                      <span className="fa fa-sign" />
                    </InputGroup.Text>
                  </InputGroup.Prepend>

                  <Form.Control
                    value={template.label}
                    type="text"
                    placeholder="the name you'll see in the app"
                    onChange={this.updateLabel}
                    width={30}
                    size={30}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>
                      What you&apos;ll select in the app
                    </InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col md="8">
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <InputGroup.Text title="Slug">
                      <span className="fa fa-tag" />
                    </InputGroup.Text>
                  </InputGroup.Prepend>

                  <Form.Control
                    value={template.slug}
                    type="text"
                    placeholder="slug (eg. My Name -> my-name)"
                    onChange={this.updateSlug}
                    onFocus={this.setDefaultSlug}
                    width={30}
                    size={30}
                    className="field-error"
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>
                      Slug to be used for the command line. Must be unique. Only
                      <code className="pl-2 slug-allowed-chars">
                        a-z 0-9 -{' '}
                      </code>
                    </InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Row>
          </> //
        ) : (
          ''
        )}

        <Row className="">
          <Col>
            <span className="ml-2 mr-2 fa fa-file" />

            <div className="name-preview border p-2">{filledPath}</div>
          </Col>
        </Row>

        {view !== 'view' ? (
          <>
            <Row className="mt-2">
              <Col>
                <span className="pl-2 mr-2 fas fa-code" /> Use the variables
                below to build your template name. Read about helpers to modify
                the variable further. A preview is above...
              </Col>
            </Row>
            <TemplateEditor
              template={template}
              record={templateVars[0]}
              shortcuts={templateVars[1]}
              updateValue={this.updatePath}
            />
          </> //
        ) : (
          ''
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  null,
  mapDispatchToProps
)(SettingsNaming);
