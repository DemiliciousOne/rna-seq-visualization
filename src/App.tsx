import React from 'react';
import axios from 'axios';
import BrushChart from './components/BrushChart';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import './assets/styles/index.css';
import { formatData, formatAnnotations } from './utils/formatData';
import { DataPoint, Annotation } from './utils/types';
import styles from './assets/styles/chart.module.css';

// initialize arrays to add the fetched data to
const sequencingData: DataPoint[] = [];
const annotationsData: Annotation[] = [];

export default function App() {
  const [data, setData] = React.useState(sequencingData);

  const [annotations, setAnnotations] = React.useState(annotationsData);

  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    // fetch data from local API endpoint
    axios
      .get('http://localhost:3001/data', {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })
      .then((response) => {
        // format data to be easily used in AreaClosed component later
        let formattedAnnotationsData = formatAnnotations(response.data.annotations);
        // format data to be easily mapped to rectangle components later
        let formattedCountsData = formatData(response.data.counts);

        setAnnotations(formattedAnnotationsData);
        setData(formattedCountsData);
        setLoading(false);
      })
      .catch((ex) => {
        // error handling
        let error = axios.isCancel(ex)
          ? 'Request Cancelled'
          : ex.code === 'ECONNABORTED'
          ? 'A timeout has occurred'
          : ex.response.status === 404
          ? 'Resource Not Found'
          : 'An unexpected error has occurred';

        console.log(error);
        setLoading(false);
      });
  }, []);
  // screen shown before data loads from API
  if (loading) {
    return <p>Fetching data...</p>;
  }
  // screen shown after data loads
  return (
    <div className={styles.backgroundStyle}>
      <h1 className={styles.headerText}>RNA-Sequencing Chart</h1>
      <ParentSize>
        {({ width }) => (
          <BrushChart width={width * 0.95} height={600} data={data} annotations={annotations} />
        )}
      </ParentSize>
    </div>
  );
}
