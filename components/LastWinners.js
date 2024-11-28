// components/LastWinners.js
import styles from './LastWinners.module.css';

export default function LastWinners({ winners }) {
  if (!winners || winners.length === 0) {
    return <p className={styles.noWinners}>No winners yet.</p>;
  }

  return (
    <div className={styles.lastWinners}>
      <h2 className={styles.title}>Last Winners</h2>
      <ul className={styles.winnersList}>
        {winners.map((winner, index) => (
          <li key={index} className={styles.winnerItem}>
            <a
              href={`https://solscan.io/account/${winner.winnerPublicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.winnerPublicKey}
              title={winner.winnerPublicKey}
            >
              {winner.winnerPublicKey.slice(0, 5)}...{winner.winnerPublicKey.slice(-5)}
            </a>
            <span className={styles.winnerPrize}>
              Won {parseFloat(winner.prize).toFixed(2)} tokens
            </span>
            <span className={styles.winnerTime}>
              {new Date(winner.endTime).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}