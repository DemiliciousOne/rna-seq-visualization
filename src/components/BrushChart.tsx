import React, { useRef, useState, useMemo, useCallback } from 'react';
import { scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush, { BaseBrushState, UpdateBrush } from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { LinearGradient } from '@visx/gradient';
import AreaChart from '../components/AreaChart';
import { colors } from '../assets/colors';
import { withTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { max, extent, bisector } from 'd3-array';
import { localPoint } from '@visx/event';
import { Line, Bar } from '@visx/shape';
import styles from '../assets/styles/chart.module.css';
import { DataPoint, Annotation } from '../utils/types';
import { DataList } from './DataList';

type TooltipData = DataPoint;
// Initialize some variables
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: colors.accentColor
};

// accessors
const getCount = (d: DataPoint) => d.count;
const getPosition = (d: DataPoint) => d.position;

// gets the position value that mouse is hovering on to set the tooltip position
const bisectData = bisector<DataPoint, number>((d) => d.position).left;

// establish props here to use below with visx' default tooltip props
export type BrushProps = {
  width: number;
  height: number;
  data: DataPoint[];
  annotations: Annotation[];
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
};

export default withTooltip<BrushProps, TooltipData>(
  ({
    compact = false,
    data,
    annotations,
    width,
    height,
    margin = {
      top: 20,
      left: 75,
      bottom: 20,
      right: 20
    },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0
  }: BrushProps & WithTooltipProvidedProps<TooltipData>) => {
    const brushRef = useRef<BaseBrush | null>(null);
    const [filteredData, setFilteredData] = useState(data);
    const onBrushChange = (domain: Bounds | null) => {
      if (!domain) return;
      const { x0, x1, y0, y1 } = domain;
      const dataCopy = data.filter((s) => {
        const x = getPosition(s);
        const y = getCount(s);
        return x > x0 && x < x1 && y > y0 && y < y1;
      });
      setFilteredData(dataCopy);
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const topChartBottomMargin = compact ? chartSeparation / 2 : chartSeparation + 20;
    const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
    const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

    // bounds
    const xMax = Math.max(innerWidth, 0);
    const yMax = Math.max(topChartHeight, 0);
    const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
    const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

    // scales
    const tooltipPositionScale = useMemo(
      () =>
        scaleLinear({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(filteredData, getPosition) as [number, number]
        }),
      [innerWidth, margin.left, filteredData]
    );
    // converts on-screen X coordinate to position value on the zoomed chart
    const positionScale = useMemo(
      () =>
        scaleLinear({
          range: [0, xMax],
          domain: extent(filteredData, getPosition) as [number, number]
        }),
      [xMax, filteredData]
    );
    // converts on-screen Y coordinate to counts value on the zoomed chart
    const countsScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [yMax, 0],
          domain: [0, max(filteredData, getCount) || 0],
          nice: true
        }),
      [yMax, filteredData]
    );
    // converts on-screen X coordinate to position value on the brushed chart
    const brushPositionScale = useMemo(
      () =>
        scaleLinear({
          range: [0, xBrushMax],
          domain: extent(data, getPosition) as [number, number]
        }),
      [xBrushMax, data]
    );
    // converts on-screen Y coordinate to counts value on the brushed chart
    const brushCountsScale = useMemo(
      () =>
        scaleLinear({
          range: [yBrushMax, 0],
          domain: [0, max(data, getCount) || 0],
          nice: true
        }),
      [yBrushMax, data]
    );
    // sets the start position and length of the brush rectangle
    const initialBrushPosition = useMemo(
      () => ({
        start: { x: brushPositionScale(getPosition(data[0])) },
        end: { x: brushPositionScale(getPosition(data[500])) }
      }),
      [brushPositionScale, data]
    );

    // event handlers
    // sets brush back to original position and length
    const handleResetClick = () => {
      if (brushRef?.current) {
        const updater: UpdateBrush = (prevBrush) => {
          const newExtent = brushRef.current!.getExtent(
            initialBrushPosition.start,
            initialBrushPosition.end
          );

          const newState: BaseBrushState = {
            ...prevBrush,
            start: { y: newExtent.y0, x: newExtent.x0 },
            end: { y: newExtent.y1, x: newExtent.x1 },
            extent: newExtent
          };

          return newState;
        };
        brushRef.current.updateBrush(updater);
      }
    };
    // finds position and count values at the on-screen X coordinate the mouse is hovering over (zoomed chart)
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = tooltipPositionScale.invert(x);
        const index = bisectData(filteredData, x0, 1);
        const d0 = filteredData[index - 1];
        const d1 = filteredData[index];
        let d = d0;
        if (d1 && getPosition(d1)) {
          d =
            x0.valueOf() - getPosition(d0).valueOf() > getPosition(d1).valueOf() - x0.valueOf()
              ? d1
              : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: countsScale(getCount(d))
        });
      },
      [showTooltip, countsScale, tooltipPositionScale]
    );

    return (
      <div className={styles.graphContainer}>
        <svg width={width} height={height}>
          <LinearGradient
            id={GRADIENT_ID}
            from={colors.background}
            to={colors.background2}
            rotate={45}
          />
          <rect x={0} y={0} width={width} height={height} fill={`url(#${GRADIENT_ID})`} rx={14} />
          <AreaChart
            hideBottomAxis={compact}
            data={filteredData}
            annotations={annotations}
            width={width}
            margin={{ ...margin, bottom: topChartBottomMargin }}
            yMax={yMax}
            xScale={positionScale}
            yScale={countsScale}
            gradientColor={colors.mainColor}
          />
          <AreaChart
            hideBottomAxis
            hideLeftAxis
            data={data}
            annotations={annotations}
            width={width}
            yMax={yBrushMax}
            xScale={brushPositionScale}
            yScale={brushCountsScale}
            margin={brushMargin}
            top={topChartHeight + topChartBottomMargin + margin.top}
            gradientColor={colors.background2}>
            <PatternLines
              id={PATTERN_ID}
              height={8}
              width={8}
              stroke={colors.accentColor}
              strokeWidth={1}
              orientation={['diagonal']}
            />
            <Brush
              xScale={brushPositionScale}
              yScale={brushCountsScale}
              width={xBrushMax}
              height={yBrushMax}
              margin={brushMargin}
              handleSize={8}
              innerRef={brushRef}
              resizeTriggerAreas={['left', 'right']}
              brushDirection="horizontal"
              initialBrushPosition={initialBrushPosition}
              onChange={onBrushChange}
              onClick={() => setFilteredData(data)}
              selectedBoxStyle={selectedBrushStyle}
              useWindowMoveEvents
            />
          </AreaChart>
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={topChartHeight + margin.top}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: topChartHeight + margin.top }}
                stroke={colors.mainColor}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 20}
                r={4}
                fill={colors.mainColor}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop + 20}
              left={tooltipLeft + 25}
              style={{
                ...defaultStyles
              }}
              className={styles.tooltip}>
              {getPosition(tooltipData)} : {getCount(tooltipData)}
            </TooltipWithBounds>
          </div>
        )}
        <button onClick={handleResetClick} className={styles.resetButtonStyle}>
          Reset Brush
        </button>
        <DataList data={filteredData} />
      </div>
    );
  }
);
