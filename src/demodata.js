// @flow
import React from 'react'
//import { generateFilterHandler } from '/imports/epi-ui/AutoSuggestBox'

const generateFilterHandler = () => ['test']
const log = console.log

export const BarChart = {
  data: [
    {
      gender: 'M',
      percentage: 0.8,
    },
    {
      gender: 'F',
      percentage: 0.2,
    },
  ],
}

export const Histogram = {
  data: [
    81,
    92,
    26,
    78,
    81,
    74,
    85,
    80,
    87,
    82,
    85,
    52,
    22,
    84,
    78,
    60,
    84,
    79,
    70,
    71,
    72,
    72,
    80,
  ],
  bins: 5,
}

export const HorizontalBarChart = {
  data: [
    {
      name: 'twitter',
      value: 10000,
    },
    {
      name: 'facebook',
      value: 5000,
    },
    {
      name: 'tumblr',
      value: 1000,
    },
  ],
}

export const LineBarChartCombo = {
  data: [
    {
      key: 'volume',
      values: [
        { y: 6, x: +new Date('2018-03-01') },
        { y: 14, x: +new Date('2018-03-02') },
        { y: 18, x: +new Date('2018-03-03') },
        { y: 17, x: +new Date('2018-03-04') },
        { y: 19, x: +new Date('2018-03-05') },
        { y: 15, x: +new Date('2018-03-06') },
        { y: 18, x: +new Date('2018-03-07') },
      ],
    },
  ],
  onBrush: log,
}

export const Spinner = {
  size: 'lg',
}

export const Table = {
  data: [
    {
      _id: 'tim',
      name: 'Tim',
      age: 25,
      quote: '<strong>My name is Tim.</strong> <i>-Tim</i>',
    },
    {
      _id: 'mike',
      name: 'Mike',
      age: 30,
      quote: '<strong>My name is Mike.</strong> <i>-Mike</i>',
    },
    {
      _id: 'sam',
      name: 'Sam',
      age: 28,
      quote: '<strong>My name is Sam.</strong> <i>-Sam</i>',
    },
  ],
  rowProps: {
    // Click handler for the row
    onClick: (e: any) => log(`Clicked on row with ID '${e.currentTarget.dataset.id}'`),
  },
  columnsConfig: [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'age',
      label: 'Age',
      // Click handler for the cell
      onClick: (e: any) => log(`Clicked on age ${e.currentTarget.innerHTML}`),
    },
    {
      key: 'quote',
      label: 'Quote',
      unsafe: true,
    },
  ],
}

export const WordCloud = {
  data: [
    { text: 'Fentanyl', size: 39 },
    { text: 'fentanyl', size: 38 },
    { text: 'Corporation', size: 13 },
    { text: 'heroin', size: 10 },
    { text: 'deaths', size: 8 },
    { text: 'overdose', size: 8 },
    { text: 'year', size: 8 },
    { text: 'Deaths', size: 7 },
    { text: 'Years', size: 5 },
    { text: 'Overdose', size: 4 },
    { text: 'crisis', size: 4 },
    { text: 'Heroin', size: 4 },
    { text: 'Count', size: 4 },
    { text: 'Three', size: 4 },
    { text: 'Ohio', size: 4 },
    { text: 'fatal', size: 4 },
    { text: 'dose', size: 4 },
    { text: 'side', size: 4 },
    { text: 'RCMP', size: 3 },
    { text: 'Vancouver', size: 3 },
    { text: 'Fossil', size: 3 },
    { text: 'Group', size: 3 },
    { text: 'shares', size: 3 },
    { text: 'hospital', size: 3 },
    { text: 'exposure', size: 3 },
    { text: 'problem', size: 3 },
    { text: 'opioids', size: 3 },
    { text: 'China', size: 3 },
    { text: 'drives', size: 3 },
    { text: 'record', size: 3 },
    { text: 'country', size: 3 },
    { text: 'save', size: 3 },
    { text: 'life', size: 3 },
    { text: 'system', size: 3 },
    { text: 'autopsy', size: 3 },
    { text: 'reveals', size: 3 },
    { text: 'Lethal', size: 3 },
    { text: 'logo', size: 3 },
    { text: 'Davidson', size: 3 },
    { text: 'will', size: 3 },
    { text: 'search', size: 2 },
    { text: 'today', size: 2 },
    { text: 'battle', size: 2 },
    { text: 'Analysts', size: 2 },
    { text: 'FOSL', size: 2 },
    { text: 'trade', size: 2 },
    { text: 'opioid', size: 2 },
    { text: 'Drug', size: 2 },
    { text: 'Crisis', size: 2 },
    { text: 'News', size: 2 },
    { text: 'kits', size: 2 },
    { text: 'training', size: 2 },
    { text: 'Nevada', size: 2 },
    { text: 'losing', size: 2 },
    { text: 'wall', size: 2 },
    { text: 'going', size: 2 },
    { text: 'issue', size: 2 },
    { text: 'death', size: 2 },
    { text: 'stopods', size: 2 },
    { text: 'overdosing', size: 2 },
    { text: 'prison', size: 2 },
    { text: 'seize', size: 2 },
    { text: 'post', size: 2 },
    { text: 'online', size: 2 },
  ],
}

export const ProgressIndicator = {
  currentStep: 3,
  totalSteps: 4,
}

export const Modal = {
  body: {
    title: (
      <div>
        Epi-UI <strong>Modal</strong>
      </div>
    ),
    dom: (
      <div>
        <code>&lt;Modal&gt;</code> supports <strong>HTML / JSX</strong>!
      </div>
    ),
  },
  active: false,
  showFooter: true,
  centerContent: false,
  onCancel: () => log('Modal cancelled!'),
  onSubmit: () => log('Modal submitted!'),
  onNext: (currentStep: number) => log(currentStep),
  onPrev: (currentStep: number) => log(currentStep),
  submitTitle: 'OK',
}

/*
export const Topics = {
  onChange: (error: Error, results: any) => log(results),
  tagsBelow: true,
}

export const GeoCoder = {}

export const ReactLoadingButton = {
  children: 'A static button in the "loading" state',
  loading: true,
}


export const ContextOnHighlight = {
  children: (
    <span>
      Highlight <b>any</b> part of this text.
    </span>
  ),
  contextMenu: (text: string) => (
    <div>
      You selected <b>"{text}"</b>. This context menu is customizable.
      <a href="#" onClick={(e: any) => e.preventDefault()} style={{ float: 'right' }}>
        OK
      </a>
    </div>
  ),
  showContextMenu: true,
  onHighlight: log,
  contextClassName: 'custom-class',
}

export const TreeMap = {
  height: 400,
  width: 400,
  valueUnit: 'posts',
  data: {
    name: 'posts',
    children: [
      {
        name: 'social',
        children: [
          {
            name: 'twitter',
            value: 10000,
          },
          {
            name: 'facebook',
            value: 5000,
          },
          {
            name: 'tumblr',
            value: 1000,
          },
        ],
      },
      {
        name: 'news',
        children: [
          { name: 'Washington Post', value: 9000 },
          { name: 'Huffington Post', value: 4000 },
          { name: 'New York Times', value: 2000 },
        ],
      },
      {
        name: 'forums',
        children: [{ name: 'WebMD', value: 4000 }, { name: 'ProMED', value: 3200 }],
      },
    ],
  },
}

export const StaticTreeMap = {
  data: {
    name: 'flare',
    children: [
      {
        name: 'analytics',
        children: [
          {
            name: 'cluster',
            children: [
              { name: 'AgglomerativeCluster', size: 3938 },
              { name: 'CommunityStructure', size: 3812 },
              { name: 'HierarchicalCluster', size: 6714 },
              { name: 'MergeEdge', size: 743 },
            ],
          },
          {
            name: 'graph',
            children: [
              { name: 'BetweennessCentrality', size: 3534 },
              { name: 'LinkDistance', size: 5731 },
              { name: 'MaxFlowMinCut', size: 7840 },
              { name: 'ShortestPaths', size: 5914 },
              { name: 'SpanningTree', size: 3416 },
            ],
          },
          {
            name: 'optimization',
            children: [{ name: 'AspectRatioBanker', size: 7074 }],
          },
        ],
      },
      {
        name: 'animate',
        children: [
          { name: 'Easing', size: 17010 },
          { name: 'FunctionSequence', size: 5842 },
          {
            name: 'interpolate',
            children: [
              { name: 'ArrayInterpolator', size: 1983 },
              { name: 'ColorInterpolator', size: 2047 },
              { name: 'DateInterpolator', size: 1375 },
              { name: 'Interpolator', size: 8746 },
              { name: 'MatrixInterpolator', size: 2202 },
              { name: 'NumberInterpolator', size: 1382 },
              { name: 'ObjectInterpolator', size: 1629 },
              { name: 'PointInterpolator', size: 1675 },
              { name: 'RectangleInterpolator', size: 2042 },
            ],
          },
          { name: 'ISchedulable', size: 1041 },
          { name: 'Parallel', size: 5176 },
          { name: 'Pause', size: 449 },
          { name: 'Scheduler', size: 5593 },
          { name: 'Sequence', size: 5534 },
          { name: 'Transition', size: 9201 },
          { name: 'Transitioner', size: 19975 },
          { name: 'TransitionEvent', size: 1116 },
          { name: 'Tween', size: 6006 },
        ],
      },
      {
        name: 'data',
        children: [
          {
            name: 'converters',
            children: [
              { name: 'Converters', size: 721 },
              { name: 'DelimitedTextConverter', size: 4294 },
              { name: 'GraphMLConverter', size: 9800 },
              { name: 'IDataConverter', size: 1314 },
              { name: 'JSONConverter', size: 2220 },
            ],
          },
          { name: 'DataField', size: 1759 },
          { name: 'DataSchema', size: 2165 },
          { name: 'DataSet', size: 586 },
          { name: 'DataSource', size: 3331 },
          { name: 'DataTable', size: 772 },
          { name: 'DataUtil', size: 3322 },
        ],
      },
      {
        name: 'display',
        children: [
          { name: 'DirtySprite', size: 8833 },
          { name: 'LineSprite', size: 1732 },
          { name: 'RectSprite', size: 3623 },
          { name: 'TextSprite', size: 10066 },
        ],
      },
      {
        name: 'flex',
        children: [{ name: 'FlareVis', size: 4116 }],
      },
      {
        name: 'physics',
        children: [
          { name: 'DragForce', size: 1082 },
          { name: 'GravityForce', size: 1336 },
          { name: 'IForce', size: 319 },
          { name: 'NBodyForce', size: 10498 },
          { name: 'Particle', size: 2822 },
          { name: 'Simulation', size: 9983 },
          { name: 'Spring', size: 2213 },
          { name: 'SpringForce', size: 1681 },
        ],
      },
      {
        name: 'query',
        children: [
          { name: 'AggregateExpression', size: 1616 },
          { name: 'And', size: 1027 },
          { name: 'Arithmetic', size: 3891 },
          { name: 'Average', size: 891 },
          { name: 'BinaryExpression', size: 2893 },
          { name: 'Comparison', size: 5103 },
          { name: 'CompositeExpression', size: 3677 },
          { name: 'Count', size: 781 },
          { name: 'DateUtil', size: 4141 },
          { name: 'Distinct', size: 933 },
          { name: 'Expression', size: 5130 },
          { name: 'ExpressionIterator', size: 3617 },
          { name: 'Fn', size: 3240 },
          { name: 'If', size: 2732 },
          { name: 'IsA', size: 2039 },
          { name: 'Literal', size: 1214 },
          { name: 'Match', size: 3748 },
          { name: 'Maximum', size: 843 },
          {
            name: 'methods',
            children: [
              { name: 'add', size: 593 },
              { name: 'and', size: 330 },
              { name: 'average', size: 287 },
              { name: 'count', size: 277 },
              { name: 'distinct', size: 292 },
              { name: 'div', size: 595 },
              { name: 'eq', size: 594 },
              { name: 'fn', size: 460 },
              { name: 'gt', size: 603 },
              { name: 'gte', size: 625 },
              { name: 'iff', size: 748 },
              { name: 'isa', size: 461 },
              { name: 'lt', size: 597 },
              { name: 'lte', size: 619 },
              { name: 'max', size: 283 },
              { name: 'min', size: 283 },
              { name: 'mod', size: 591 },
              { name: 'mul', size: 603 },
              { name: 'neq', size: 599 },
              { name: 'not', size: 386 },
              { name: 'or', size: 323 },
              { name: 'orderby', size: 307 },
              { name: 'range', size: 772 },
              { name: 'select', size: 296 },
              { name: 'stddev', size: 363 },
              { name: 'sub', size: 600 },
              { name: 'sum', size: 280 },
              { name: 'update', size: 307 },
              { name: 'variance', size: 335 },
              { name: 'where', size: 299 },
              { name: 'xor', size: 354 },
              { name: '_', size: 264 },
            ],
          },
          { name: 'Minimum', size: 843 },
          { name: 'Not', size: 1554 },
          { name: 'Or', size: 970 },
          { name: 'Query', size: 13896 },
          { name: 'Range', size: 1594 },
          { name: 'StringUtil', size: 4130 },
          { name: 'Sum', size: 791 },
          { name: 'Variable', size: 1124 },
          { name: 'Variance', size: 1876 },
          { name: 'Xor', size: 1101 },
        ],
      },
      {
        name: 'scale',
        children: [
          { name: 'IScaleMap', size: 2105 },
          { name: 'LinearScale', size: 1316 },
          { name: 'LogScale', size: 3151 },
          { name: 'OrdinalScale', size: 3770 },
          { name: 'QuantileScale', size: 2435 },
          { name: 'QuantitativeScale', size: 4839 },
          { name: 'RootScale', size: 1756 },
          { name: 'Scale', size: 4268 },
          { name: 'ScaleType', size: 1821 },
          { name: 'TimeScale', size: 5833 },
        ],
      },
      {
        name: 'util',
        children: [
          { name: 'Arrays', size: 8258 },
          { name: 'Colors', size: 10001 },
          { name: 'Dates', size: 8217 },
          { name: 'Displays', size: 12555 },
          { name: 'Filter', size: 2324 },
          { name: 'Geometry', size: 10993 },
          {
            name: 'heap',
            children: [{ name: 'FibonacciHeap', size: 9354 }, { name: 'HeapNode', size: 1233 }],
          },
          { name: 'IEvaluable', size: 335 },
          { name: 'IPredicate', size: 383 },
          { name: 'IValueProxy', size: 874 },
          {
            name: 'math',
            children: [
              { name: 'DenseMatrix', size: 3165 },
              { name: 'IMatrix', size: 2815 },
              { name: 'SparseMatrix', size: 3366 },
            ],
          },
          { name: 'Maths', size: 17705 },
          { name: 'Orientation', size: 1486 },
          {
            name: 'palette',
            children: [
              { name: 'ColorPalette', size: 6367 },
              { name: 'Palette', size: 1229 },
              { name: 'ShapePalette', size: 2059 },
              { name: 'SizePalette', size: 2291 },
            ],
          },
          { name: 'Property', size: 5559 },
          { name: 'Shapes', size: 19118 },
          { name: 'Sort', size: 6887 },
          { name: 'Stats', size: 6557 },
          { name: 'Strings', size: 22026 },
        ],
      },
      {
        name: 'vis',
        children: [
          {
            name: 'axis',
            children: [
              { name: 'Axes', size: 1302 },
              { name: 'Axis', size: 24593 },
              { name: 'AxisGridLine', size: 652 },
              { name: 'AxisLabel', size: 636 },
              { name: 'CartesianAxes', size: 6703 },
            ],
          },
          {
            name: 'controls',
            children: [
              { name: 'AnchorControl', size: 2138 },
              { name: 'ClickControl', size: 3824 },
              { name: 'Control', size: 1353 },
              { name: 'ControlList', size: 4665 },
              { name: 'DragControl', size: 2649 },
              { name: 'ExpandControl', size: 2832 },
              { name: 'HoverControl', size: 4896 },
              { name: 'IControl', size: 763 },
              { name: 'PanZoomControl', size: 5222 },
              { name: 'SelectionControl', size: 7862 },
              { name: 'TooltipControl', size: 8435 },
            ],
          },
          {
            name: 'data',
            children: [
              { name: 'Data', size: 20544 },
              { name: 'DataList', size: 19788 },
              { name: 'DataSprite', size: 10349 },
              { name: 'EdgeSprite', size: 3301 },
              { name: 'NodeSprite', size: 19382 },
              {
                name: 'render',
                children: [
                  { name: 'ArrowType', size: 698 },
                  { name: 'EdgeRenderer', size: 5569 },
                  { name: 'IRenderer', size: 353 },
                  { name: 'ShapeRenderer', size: 2247 },
                ],
              },
              { name: 'ScaleBinding', size: 11275 },
              { name: 'Tree', size: 7147 },
              { name: 'TreeBuilder', size: 9930 },
            ],
          },
          {
            name: 'events',
            children: [
              { name: 'DataEvent', size: 2313 },
              { name: 'SelectionEvent', size: 1880 },
              { name: 'TooltipEvent', size: 1701 },
              { name: 'VisualizationEvent', size: 1117 },
            ],
          },
          {
            name: 'legend',
            children: [
              { name: 'Legend', size: 20859 },
              { name: 'LegendItem', size: 4614 },
              { name: 'LegendRange', size: 10530 },
            ],
          },
          {
            name: 'operator',
            children: [
              {
                name: 'distortion',
                children: [
                  { name: 'BifocalDistortion', size: 4461 },
                  { name: 'Distortion', size: 6314 },
                  { name: 'FisheyeDistortion', size: 3444 },
                ],
              },
              {
                name: 'encoder',
                children: [
                  { name: 'ColorEncoder', size: 3179 },
                  { name: 'Encoder', size: 4060 },
                  { name: 'PropertyEncoder', size: 4138 },
                  { name: 'ShapeEncoder', size: 1690 },
                  { name: 'SizeEncoder', size: 1830 },
                ],
              },
              {
                name: 'filter',
                children: [
                  { name: 'FisheyeTreeFilter', size: 5219 },
                  { name: 'GraphDistanceFilter', size: 3165 },
                  { name: 'VisibilityFilter', size: 3509 },
                ],
              },
              { name: 'IOperator', size: 1286 },
              {
                name: 'label',
                children: [
                  { name: 'Labeler', size: 9956 },
                  { name: 'RadialLabeler', size: 3899 },
                  { name: 'StackedAreaLabeler', size: 3202 },
                ],
              },
              {
                name: 'layout',
                children: [
                  { name: 'AxisLayout', size: 6725 },
                  { name: 'BundledEdgeRouter', size: 3727 },
                  { name: 'CircleLayout', size: 9317 },
                  { name: 'CirclePackingLayout', size: 12003 },
                  { name: 'DendrogramLayout', size: 4853 },
                  { name: 'ForceDirectedLayout', size: 8411 },
                  { name: 'IcicleTreeLayout', size: 4864 },
                  { name: 'IndentedTreeLayout', size: 3174 },
                  { name: 'Layout', size: 7881 },
                  { name: 'NodeLinkTreeLayout', size: 12870 },
                  { name: 'PieLayout', size: 2728 },
                  { name: 'RadialTreeLayout', size: 12348 },
                  { name: 'RandomLayout', size: 870 },
                  { name: 'StackedAreaLayout', size: 9121 },
                  { name: 'TreeMapLayout', size: 9191 },
                ],
              },
              { name: 'Operator', size: 2490 },
              { name: 'OperatorList', size: 5248 },
              { name: 'OperatorSequence', size: 4190 },
              { name: 'OperatorSwitch', size: 2581 },
              { name: 'SortOperator', size: 2023 },
            ],
          },
          { name: 'Visualization', size: 16540 },
        ],
      },
    ],
  },
}

export const DataCoverage = {
  data: [
    {
      date: '2011-01-14T16:17:54Z',
      organization: 'Booz Allen Hamilton',
      source: {
        name: 'social',
        count: 0,
        children: [{ name: 'twitter', count: 0 }, { name: 'facebook', count: 0 }],
      },
    },
    {
      date: '2011-01-14T16:17:54Z',
      organization: 'Booz Allen Hamilton',
      source: {
        name: 'news',
        count: 250,
        children: [{ name: 'A', count: 120 }, { name: 'B', count: 130 }],
      },
    },
    {
      date: '2011-02-14T16:17:54Z',
      organization: 'Booz Allen Hamilton',
      source: {
        name: 'social',
        count: 20,
        children: [{ name: 'twitter', count: 10 }, { name: 'facebook', count: 10 }],
      },
    },
    {
      date: '2011-02-14T16:17:54Z',
      organization: 'Booz Allen Hamilton',
      source: {
        name: 'news',
        count: 250,
        children: [{ name: 'A', count: 120 }, { name: 'B', count: 130 }],
      },
    },
    {
      date: '2011-03-14T16:17:54Z',
      organization: 'Booz Allen Hamilton',
      source: {
        name: 'social',
        count: 0,
        children: [{ name: 'twitter', count: 0 }, { name: 'facebook', count: 0 }],
      },
    },
    {
      date: '2011-03-14T16:17:54Z',
      organization: 'Booz Allen Hamilton',
      source: {
        name: 'news',
        count: 250,
        children: [{ name: 'A', count: 120 }, { name: 'B', count: 130 }],
      },
    },
  ],
}

export const DictionaryMap = {
  // DictionaryMap options
  onChange: (mappings: Array<Object>) => log(mappings),
  mappings: [
    [{ id: 680, text: 'Tecfidera' }, { id: 17, text: 'Rash' }],
    [{ id: 680, text: 'Advil' }, { id: 1006, text: 'Fever' }],
  ],

  // Products
  handleFilterSuggestions: generateFilterHandler('products'), // This overrules suggestions below
  placeholder: 'Product',
  suggestions: ['Advil', 'Tecfidera', 'Tylenol', 'Product X', 'Product Y', 'Product Z'],
  minQueryLength: 0,

  // Symptoms
  rhandleFilterSuggestions: generateFilterHandler('symptoms'), // This overrules suggestions below
  rplaceholder: 'Symptom',
  rsuggestions: ['Rash', 'Fever', 'Coughing', 'Weight Loss', 'Weight gain'],
  rminQueryLength: 0,
}

export const DateRangePicker = {
  onChange: log.bind(console),
}



export const ExplodeChart = {
  data: [
    {
      key: 'Number of cases',
      values: [
        {
          datetime: '01/20/2016',
          records: 10,
        },
        {
          datetime: '01/21/2016',
          records: 15,
        },
        {
          datetime: '01/22/2016',
          records: 15,
        },
      ],
    },
  ],
}

// export const Map = { geojson: { id: 1, data: { type: 'FeatureCollection', crs: { type: 'name', properties: { name: 'EPSG:3857', }, }, features: [ { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0], }, }, { type: 'Feature', geometry: { type: 'MultiLineString', coordinates: [ [[-1e6, -7.5e5], [-1e6, 7.5e5]], [[1e6, -7.5e5], [1e6, 7.5e5]], [[-7.5e5, -1e6], [7.5e5, -1e6]], [[-7.5e5, 1e6], [7.5e5, 1e6]], ], }, }, ], }, }, }

export const DonutChart = {
  data: {
    commercial: 1,
    construction: 2,
    farm: 16,
    grass: 10,
  },
}

export const GroupedBarchart = {
  data: {
    Business: {
      company1: 0.1,
      company2: 0.3,
      company3: 0.6,
      company4: 1,
      company5: 0.4,
    },
    Digital: {
      company1: 0.7,
      company2: 0.6,
      company3: -0.4,
      company4: -0.6,
      company5: 0.1,
    },
    Health: {
      company1: 0.1,
      company2: 0.5,
      company3: -0.3,
      company4: 0.6,
      company5: 1,
    },
    Cyber: {
      company1: 0.1,
      company2: -0.6,
      company3: 0.5,
      company4: -0.3,
      company5: 0.8,
    },
  },
  label: 'Sentiment',
}


  */
