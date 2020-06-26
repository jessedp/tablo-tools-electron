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
import type NamingTemplateType from '../constants/app';

type Props = {
  template: NamingTemplateType,
  data: Object,
  updateValue: (value: string) => void
};
type State = {
  workingValue: string,
  position: { column: number, row: number }
};

class TemplateEditor extends Component<Props, State> {
  editorRef: any;

  constructor(props: Props) {
    super(props);
    this.editorRef = React.createRef();
    this.state = {
      workingValue: props.template.template,
      position: { column: 0, row: 0 }
    };
    (this: any).onCursorChange = this.onCursorChange.bind(this);
    (this: any).onChange = this.onChange.bind(this);
    (this: any).selectJson = this.selectJson.bind(this);
  }

  selectJson(node: Object) {
    const { updateValue } = this.props;
    const { position } = this.state;
    let { workingValue } = this.state;
    // if (location.idx < 0) return;
    console.log('LEN', node.namespace.length);
    console.log('NAME', node.name);
    console.log('NS', node.namespace);
    let path = node.name; // ;
    if (node.namespace.length) {
      const start = node.namespace.join('.');
      path = `${start}.${path}`;
    }

    const tag = `{{${path}}}`;

    const p1 = workingValue.slice(0, position.column);
    const p3 = workingValue.slice(position.column);
    workingValue = `${p1}${tag}${p3}`;
    this.setState({ workingValue });
    updateValue(workingValue);
  }

  onChange(value: string) {
    const { updateValue } = this.props;

    const workingValue = value.trim();
    // console.log('change', value, workingValue);
    this.setState({ workingValue });
    updateValue(workingValue);
  }

  // onSelectionChange(newValue, event) {
  //   this.session = newValue;
  //   console.log('select-change', newValue);
  //   console.log('select-change-event', event);
  // }
  // // newValue|select.cursor.column

  onCursorChange(newValue: any) {
    // console.log('cursor-change', newValue);
    // console.log('cursor-change-event', event);

    const position = {
      column: newValue.cursor.column,
      row: newValue.cursor.row
    };
    this.setState({ position });
  }

  render() {
    const { data } = this.props;
    const { workingValue } = this.state;
    return (
      <>
        <Row>
          <Col>
            <ReactJson
              src={data}
              onSelect={this.selectJson}
              enableClipboard={false}
              collapsed={1}
              displayDataTypes={false}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="examples column border m-2">
              <AceEditor
                ref={this.editorRef}
                placeholder="Start entering a template..."
                width="100%"
                lineHeight="30px"
                minLines={2}
                maxLines={2}
                wrapEnabled
                mode="handlebars"
                theme="textmate"
                name="template-editor"
                onChange={this.onChange}
                onCursorChange={this.onCursorChange}
                value={workingValue}
                fontSize="16px"
                showPrintMargin={false}
                showGutter
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
      </> //
    );
  }
}
export default TemplateEditor;
