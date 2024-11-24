// components/LastWinners.js
import { useEffect, useState } from 'react';
import styles from './LastWinners.module.css';
import { fetchWinners } from '../utils/api';

export default function LastWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getWinners() {
      try {
        const data = await fetchWinners();
        console.log('Fetched winners:', data);

        setWinners(data);
      } catch (err) {
        console.error('Error in getWinners:', err);
        setError('Failed to load winners.');
      } finally {
        setLoading(false);
      }
    }
    getWinners();
  }, []);

  if (loading) {
    return <p className={styles.loading}>Loading winners...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.lastWinners}>
      <h2 className={styles.title}>Last Winners</h2>
      {winners.length === 0 ? (
        <p className={styles.noWinners}>No winners yet.</p>
      ) : (
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
      )}
    </div>
  );
}