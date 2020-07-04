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
  newTemplate,
  upsertTemplate,
  isCurrentTemplate,
  isDefaultTemplate,
  fillTemplate,
  deleteTemplate
} from '../utils/namingTpl';

import type NamingTemplateType from '../constants/app';
import { setConfigItem } from '../utils/config';
import { titleCase, asyncForEach } from '../utils/utils';
import Airing from '../utils/Airing';
import DuplicateNames from './DuplicateNames';
import NamingPreview from './NamingPreview';

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
  duplicates: any,
  previews: any,
  defaultTemplate: NamingTemplateType,
  template: NamingTemplateType,
  templateVars: Object
};

class SettingsNaming extends Component<Props, State> {
  // to reset when canceling editing
  originalTemplate: NamingTemplateType;

  constructor() {
    super();
    this.state = {
      view: 'view',
      templateVars: [],
      template: {},
      error: '',
      duplicates: null,
      previews: null,
      defaultTemplate: {}
    };

    this.setView = this.setView.bind(this);
    this.cancel = this.cancel.bind(this);
    this.delete = this.delete.bind(this);
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

    await this.setState({ defaultTemplate: template, template, templateVars });
    await this.checkErrors();
  }

  checkErrors = async () => {
    const { type } = this.props;
    const { template } = this.state;
    if (!template) return;
    // const { slug } = template;

    const error = '';
    // if (slug === getDefaultTemplateSlug()) {
    //   error = 'default slug';
    //   this.setState({ error });
    //   return true;
    // }
    const files = {};

    const recType = new RegExp(type);
    const recs = await global.RecDb.asyncFind(
      { path: { $regex: recType } },
      { limit: 1000 }
    );

    await asyncForEach(recs, async rec => {
      const airing = await Airing.create(rec);
      const vars = await buildTemplateVars(airing);
      const file = fillTemplate(template, vars);

      if (Array.isArray(files[file])) {
        files[file].push(airing);
      } else {
        files[file] = [airing];
      }
    });
    const previews = <NamingPreview files={files} />;
    const uniqueNames = files.length;
    let duplicates;
    if (uniqueNames !== recs.length) {
      duplicates = <DuplicateNames files={files} total={recs.length} />;
    }

    this.setState({ error, duplicates, previews });

    return false;
  };

  updateTemplate = (template: NamingTemplateType) => {
    this.originalTemplate = template;
    this.setState({ template });
    this.checkErrors();
  };

  setDefaultTemplate = (template: NamingTemplateType) => {
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
      message: `${titleCase(nextTemplate.type)} will now use ${
        nextTemplate.label
      }`
    });
    this.setState({ defaultTemplate: nextTemplate });
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
    this.checkErrors();
    // console.log('updatePath', path, 'template', template);

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

  delete = async () => {
    const { type, sendFlash } = this.props;
    const { template } = this.state;

    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you wish to delete this temaplte?'))
      return;

    await deleteTemplate(template);
    this.setState({ template: await getTemplate(type) });
    sendFlash({ type: 'success', message: `Deleted "${template.label}"` });
  };

  setView = (view: string) => {
    this.setState({ view });
  };

  render() {
    const { label, type } = this.props;
    const {
      view,
      template,
      defaultTemplate,
      templateVars,
      error,
      duplicates,
      previews
    } = this.state;

    if (!template || !template.template) return <></>; //

    const filledPath = fillTemplate(template, templateVars);

    return (
      <div className="mb-3">
        <Row className="pb-0 mb-0">
          <Col md="3">
            <Alert variant="dark" className="p-1 pl-3">
              <span className="pl-1 naming-tpl-header">{label}</span>
            </Alert>
          </Col>
          <Col md="5" className="mt-1">
            <div className="d-flex flex-row">
              {view === 'view' ? (
                <div className="d-flex">
                  <Button
                    size="xs"
                    variant="success"
                    onClick={this.new}
                    className="mr-2 float-right "
                    title="New Template"
                  >
                    <span className="fas fa-plus" />
                  </Button>
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => this.setView('edit')}
                    title="Edit Template"
                    className="mr-2"
                  >
                    <span className="fa fa-edit" />
                  </Button>
                  {!isCurrentTemplate(template) ? (
                    <Button
                      size="xs"
                      variant="outline-danger"
                      onClick={this.delete}
                      title="Delete Template"
                      className="mr-2"
                    >
                      <span className="fa fa-trash" />
                    </Button>
                  ) : (
                    ''
                  )}

                  <NamingTemplateOptions
                    type={type}
                    slug={template.slug}
                    updateTemplate={this.updateTemplate}
                    setDefaultTemplate={this.setDefaultTemplate}
                  />
                </div>
              ) : (
                ''
              )}

              {view !== 'view' ? (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={this.cancel}
                  title="cancel"
                >
                  <span className="fas fa-window-close naming-icons" />
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
                  title="Save Template"
                >
                  <span className="fa fa-save naming-icons" />
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
              {view !== 'view' && duplicates ? duplicates : ''}
              {view !== 'view' && previews ? previews : ''}
            </div>
          </Col>
          <Col className="mt-1">
            {view === 'view' ? (
              <div className="d-flex flex-row-reverse">
                <Alert variant="light" className="p-1 smallerish">
                  <i className="mr-2">default:</i> {defaultTemplate.label}
                </Alert>
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
                    disabled={isDefaultTemplate(template)}
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
                    disabled={isDefaultTemplate(template)}
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

        <Row>
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
