import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

type Props = {
  keys: Array<string>,
  indexBy: string,
  data: Array<any>,
  scheme?: string,
  height?: number,
  width?: number
};

export default function MediumBar(props: Props) {
  const { data, scheme, keys, indexBy, height, width } = props;

  const margin = { top: 10, right: 0, bottom: 40, left: 40 };

  const styles = {
    root: {
      fontFamily: 'consolas, sans-serif',
      textAlign: 'center',
      position: 'relative',
      width,
      height,
      margin: '10px 0 10px 0'
    },
    overlay: {
      position: 'absolute',
      top: 0,
      right: margin.right,
      bottom: 0,
      left: margin.left,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      color: '#000',
      // background: "#FFFFFF33",
      textAlign: 'center',
      // This is important to preserve the chart interactivity
      pointerEvents: 'none'
    },
    totalLabel: {
      fontSize: 12
    }
  };

  const legends = [
    {
      dataFrom: 'keys',
      anchor: 'bottom-right',
      direction: 'column',
      justify: false,
      translateX: 120,
      translateY: 0,
      itemsSpacing: 2,
      itemWidth: 0,
      itemHeight: 20,
      itemDirection: 'left-to-right',
      itemOpacity: 0.85,
      symbolSize: 20,
      effects: [
        {
          on: 'hover',
          style: {
            itemOpacity: 1
          }
        }
      ]
    }
  ];

  return (
    <div style={styles.root}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={margin}
        padding={0.3}
        colors={{ scheme }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0
        }}
        axisLeft={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0
        }}
        legends={legends}
        motionStiffness={90}
        motionDamping={15}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        enableGridX
      />
    </div>
  );
}
MediumBar.defaultProps = {
  scheme: 'nivo',
  height: 200,
  width: 300
};
