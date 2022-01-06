import React from 'react';
import { Group } from '@visx/group';
import { AreaClosed } from '@visx/shape';
import { AxisLeft, AxisBottom, AxisScale } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { colors } from '../assets/colors';
import { Text } from '@visx/text';
import { DataPoint, Annotation } from '../utils/types';

// Initialize some props variables for formatting and styling the two axis
const axisBottomTickLabelProps = {
  textAnchor: 'middle' as const,
  fontFamily: 'Poppins',
  fontSize: 10,
  fill: colors.axisColor
};
const axisLeftTickLabelProps = {
  dx: '-0.25em',
  dy: '0.25em',
  fontFamily: 'Poppins',
  fontSize: 10,
  textAnchor: 'end' as const,
  fill: colors.axisColor
};
const axisBottomLabelProps = {
  fontSize: 12,
  fill: colors.axisColor,
  fontFamily: 'Poppins'
};

const axisLeftLabelProps = {
  fontSize: 12,
  fill: colors.axisColor,
  fontFamily: 'Poppins',
  x: -250
};

// accessors
const getCount = (d: DataPoint) => d.count;
const getPosition = (d: DataPoint) => d.position;

export default function AreaChart({
  data,
  annotations,
  gradientColor,
  width,
  yMax,
  margin,
  xScale,
  yScale,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top,
  left,
  children
}: {
  data: DataPoint[];
  annotations: Annotation[];
  gradientColor: string;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
  width: number;
  yMax: number;
  margin: { top: number; right: number; bottom: number; left: number };
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  top?: number;
  left?: number;
  children?: React.ReactNode;
}) {
  if (width < 10) return null;

  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <LinearGradient
        id="gradient"
        from={gradientColor}
        fromOpacity={1}
        to={gradientColor}
        toOpacity={0.2}
      />
      <AreaClosed<DataPoint>
        data={data}
        x={(d) => xScale(getPosition(d)) || 0}
        y={(d) => yScale(getCount(d)) || 0}
        yScale={yScale}
        strokeWidth={1}
        stroke="url(#gradient)"
        fill="url(#gradient)"
        curve={curveMonotoneX}
      />
      {hideBottomAxis && // annotations only show on the brushed chart
        annotations.map((annotation) => (
          <svg key={annotation.gene}>
            <rect
              x={xScale(annotation.range[0])}
              y={0}
              width={xScale(annotation.range[1] - annotation.range[0])}
              height={'80%'}
              fill={colors.accentColor}
              rx={14}
              opacity={'0.05'}
            />
            <Text
              verticalAnchor="middle"
              textAnchor="middle"
              x={xScale((annotation.range[0] + annotation.range[1]) / 2)}
              y={120}
              fill={colors.mainColor}
              fontFamily="Arial"
              fontSize={12}>
              {annotation.gene}
            </Text>
          </svg>
        ))}
      {!hideBottomAxis && ( // bottom axis only shows on the zoomed chart
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={width > 520 ? 10 : 5}
          stroke={colors.axisColor}
          tickStroke={colors.axisColor}
          tickLabelProps={() => axisBottomTickLabelProps}
          label="Genomic Position"
          labelProps={axisBottomLabelProps}
        />
      )}
      {!hideLeftAxis && ( // left axis only shows on the zoomed chart
        <AxisLeft
          scale={yScale}
          numTicks={5}
          stroke={colors.axisColor}
          tickStroke={colors.axisColor}
          tickLabelProps={() => axisLeftTickLabelProps}
          label="Gene Expression (Counts)"
          labelProps={axisLeftLabelProps}
        />
      )}
      {children}
    </Group>
  );
}
