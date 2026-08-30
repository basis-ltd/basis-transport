export interface Geometry {
  type:
    | 'Point'
    | 'LineString'
    | 'Polygon'
    | 'MultiPoint'
    | 'MultiLineString'
    | 'MultiPolygon'
    | 'GeometryCollection';
  coordinates: number[];
}

/** One labelled value on a chart axis. Every chart in the app takes these. */
export interface ChartDataPoint {
  name: string;
  value: number;
}
