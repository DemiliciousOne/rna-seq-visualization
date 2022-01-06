import styles from '../assets/styles/chart.module.css';
import { DataPoint } from '../utils/types';

type DataListProps = {
  data: DataPoint[];
};

export const DataList = ({ data }: DataListProps) => (
  <div className={styles.dataListContainer}>
    <h2 className={styles.dataHeaderStyle}>Filtered Data</h2>
    <p className={styles.dataHeaderStyle}>Position : Count</p>
    <div className={styles.dataContainer}>
      <ul className={styles.listStyle}>
        {data.map((point) => (
          <li key={point.position}>
            <p>
              {point.position} : {point.count}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
