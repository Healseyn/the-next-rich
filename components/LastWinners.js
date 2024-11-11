// components/LastWinners.js
import styles from './LastWinners.module.css';

export default function LastWinners({ winners }) {
  return (
    <div className={styles.lastWinners}>
      <h2 className={styles.title}>Last Winners</h2>
      {winners.length === 0 ? (
        <p className={styles.noWinners}>No winners yet.</p>
      ) : (
        <ul className={styles.winnersList}>
          {winners.map((winner, index) => (
            <li key={index} className={styles.winnerItem}>
              <span className={styles.winnerName}>{winner.name}</span>
              <span className={styles.winnerAmount}>Won {winner.amount} tokens</span>
              <span className={styles.winnerTime}>{winner.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
