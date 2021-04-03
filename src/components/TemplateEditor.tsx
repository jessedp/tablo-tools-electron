// @flow
import React, { Component } from 'react';

import AceEditor from 'react-ace';
import ReactJson from 'react-json-view';

// import 'ace-builds/webpack-resolver';

import 'ace-builds/src-noconflict/mode-handlebars';
import 'ace-builds/src-noconflict/theme-kuroir';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/ext-language_tools';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Alert } from 'react-bootstrap';
import type NamingTemplateType from '../constants/app';

type Props = {
  template: NamingTemplateType,
  record: Object,
  shortcuts: Object,
  updateValue: (value: string) => void
};
type State = {
  workingValue: NamingTemplateType,
  position: { column: number, row: number }
};

class TemplateEditor extends Component<Props, State> {
  editorRef: any;

  constructor(props: Props) {
    super(props);
    this.editorRef = React.createRef();
    this.state = {
      workingValue: props.template,
      position: { column: 0, row: 0 }
    };
    (this: any).onCursorChange = this.onCursorChange.bind(this);
    (this: any).onChange = this.onChange.bind(this);
    (this: any).selectJson = this.selectJson.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { template } = this.props;

    if (prevProps.template !== template) {
      this.refresh(template);
    }
  }

  refresh = (template: NamingTemplateType) => {
    this.setState({ workingValue: template });
  };

  selectJson(node: Object) {
    const { updateValue } = this.props;
    const { position } = this.state;
    const { workingValue } = this.state;

    let path = node.name;
    if (node.namespace.length) {
      const start = node.namespace.join('.');
      path = `${start}.${path}`;
    }

    const tag = `{{${path}}}`;

    const p1 = workingValue.template.slice(0, position.column);
    const p3 = workingValue.template.slice(position.column);
    workingValue.template = `${p1}${tag}${p3}`;
    this.setState({ workingValue });
    updateValue(workingValue.template);
    this.editorRef.current.editor.focus();
  }

  onChange(value: string) {
    const { updateValue } = this.props;

    const { workingValue } = this.state;

    workingValue.template = value.trim();

    this.setState({ workingValue });
    updateValue(workingValue.template);
  }

  onCursorChange(newValue: any) {
    const position = {
      column: newValue.cursor.column,
      row: newValue.cursor.row
    };
    this.setState({ position });
  }

  render() {
    const { record, shortcuts } = this.props;
    const { workingValue } = this.state;
    return (
      <>
        <Row>
          <Col>
            <div className="examples column border m-2">
              <AceEditor
                ref={this.editorRef}
                placeholder="Start entering a template..."
                width="100%"
                lineHeight="30px"
                minLines={3}
                maxLines={3}
                wrapEnabled
                mode="handlebars"
                theme="textmate"
                name="template-editor"
                onChange={this.onChange}
                onCursorChange={this.onCursorChange}
                value={workingValue.template}
                fontSize="16px"
                showPrintMargin={false}
                showGutter={false}
                highlightActiveLine={false}
                setOptions={{
                  useWorker: false,
                  showLineNumbers: false,
                  tabSize: 2
                }}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <Alert size="sm" variant="primary" className="p-0 pl-3 mb-0">
              shortcuts - common combinations/modications of original values
            </Alert>
            <ReactJson
              src={shortcuts}
              onSelect={this.selectJson}
              enableClipboard={false}
              collapsed={1}
              displayDataTypes={false}
            />
          </Col>
          <Col>
            <Alert size="sm" variant="secondary" className="p-0 pl-3 mb-0">
              &#34;full&#34; record
            </Alert>

            <ReactJson
              src={record}
              onSelect={this.selectJson}
              enableClipboard={false}
              collapsed={1}
              displayDataTypes={false}
            />
          </Col>
        </Row>
      </> //
    );
  }
}
export default TemplateEditor;
