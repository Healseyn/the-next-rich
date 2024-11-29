// components/PrizePool.js
import styles from './PrizePool.module.css';

export default function PrizePool({ amount }) {
  return (
    <div className={styles.prizePoolContainer}>
      <div className={styles.prizePoolTitle}>Current Prize Pool</div>
      <div className={styles.prizePoolAmount}>{amount.toFixed(2)} tokens</div>
    </div>
  );
}