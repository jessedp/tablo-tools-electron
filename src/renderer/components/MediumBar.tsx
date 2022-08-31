import React, { CSSProperties } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { LegendProps } from '@nivo/legends';
import { ColorSchemeId } from '@nivo/colors/dist/types/schemes/all';

type Props = {
  keys: Array<string>;
  indexBy: string;
  data: Array<any>;
  scheme?: ColorSchemeId;
  height?: number;
  width?: number;
  layout?: 'horizontal' | 'vertical' | undefined;
  onClick?: (...args: Array<any>) => any;
  back?: ((...args: Array<any>) => any) | null;
};

export default function MediumBar(props: Props): JSX.Element {
  const { data, scheme, keys, indexBy, height, width, layout, onClick, back } =
    props;
  let minHeight = height || 200;
  const min = 8;

  if (data.length > min) {
    minHeight += (data.length - min) * 30;
  }

  keys.sort();
  // let colorBy;
  // if (keys.length === 1) colorBy = 'index';
  let margin = {
    top: 0,
    right: 5,
    bottom: 50,
    left: 40,
  };

  if (layout === 'horizontal') {
    let max = 0;
    data.forEach((item) => {
      max = Math.max(max, item[indexBy].length);
    });
    // giving 10px per letter margin
    let mult = 10;

    if (data.length < 9) {
      mult = 7;
    } else if (data.length < 12) {
      mult = 10;
    } else if (data.length < 15) {
      mult = 4;
    } else if (data.length < 25) {
      mult = 7;
    }

    margin = {
      top: 0,
      right: 0,
      bottom: 40,
      left: max * mult,
    };
  }

  const styles: Record<string, CSSProperties> = {
    root: {
      fontFamily: 'consolas, sans-serif',
      textAlign: 'center',
      position: 'relative',
      maxWidth: width,
      height: minHeight,
      margin: '10px 0 10px 0',
      minWidth: '250px',
    },
    button: {
      position: 'absolute',
      bottom: 10,
      width: 60,
      height: 20,
      left: 0,
      display: 'block',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      color: 'huntergreen',
      textAlign: 'center',
      cursor: 'pointer',
    },
    totalLabel: {
      fontSize: 12,
    },
  };

  const legend: LegendProps = {
    // dataFrom: 'keys',
    anchor: 'bottom-right',
    direction: 'column',
    justify: false,
    translateX: 120,
    translateY: 0,
    itemsSpacing: 0,
    itemWidth: 70,
    itemHeight: 20,
    itemDirection: 'left-to-right',
    itemOpacity: 0.85,
    symbolSize: 20,
    effects: [
      {
        on: 'hover',
        style: {
          itemOpacity: 1,
        },
      },
    ],
  };
  const dataFrom: { dataFrom: 'indexes' | 'keys' } = { dataFrom: 'keys' };

  const legends = [{ ...dataFrom, ...legend }];

  return (
    <div style={styles.root}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        onClick={onClick}
        margin={margin}
        padding={0.3}
        colors={scheme ? { scheme } : undefined}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        axisTop={null}
        layout={layout}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 7,
          tickRotation: 60,
        }}
        axisLeft={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
        }}
        legends={legends}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        enableGridX
        onMouseEnter={(_data: any, event: any) => {
          // eslint-disable-next-line no-param-reassign
          event.target.style.cursor = 'pointer';
        }}
        onMouseLeave={(_data: any, event: any) => {
          // eslint-disable-next-line no-param-reassign
          event.target.style.cursor = 'cursor';
        }}
      />

      {back ? (
        <div
          style={styles.button}
          onClick={back}
          onKeyDown={back}
          role="button"
          tabIndex={0}
        >
          <span className="fa fa-arrow-circle-left pr-1" />
          back
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
MediumBar.defaultProps = {
  scheme: 'nivo',
  height: 200,
  width: 300,
  layout: 'vertical',
  onClick: () => undefined,
  back: null,
};
