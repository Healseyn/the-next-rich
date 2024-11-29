// components/LastWinners.js
import styles from './LastWinners.module.css';

export default function LastWinners({ winners, activeRound, hasSpun }) {
  if (!winners || winners.length === 0) {
    return <p className={styles.noWinners}>No winners yet.</p>;
  }

  // Filtrar o ganhador da rodada atual se o giro não tiver sido concluído
  const filteredWinners = winners.filter((winner) => {
    if (!activeRound) return true; // Se não houver rodada ativa, mostrar todos
    if (hasSpun) return true; // Se o giro já ocorreu, mostrar todos
    return winner.id !== activeRound.id; // Excluir o ganhador da rodada atual
  });

  return (
    <div className={styles.lastWinners}>
      <h2 className={styles.title}>Last Winners</h2>
      <ul className={styles.winnersList}>
        {filteredWinners.map((winner, index) => {
          const publicKey = winner.winnerPublicKey || 'Unknown';
          const prize = winner.prize || 0;
          const endTime = winner.endTime || 'Unknown time';

          return (
            <li key={index} className={styles.winnerItem}>
              <a
                href={`https://solscan.io/account/${publicKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.winnerPublicKey}
                title={publicKey}
              >
                {publicKey !== 'Unknown'
                  ? `${publicKey.slice(0, 5)}...${publicKey.slice(-5)}`
                  : 'Unknown'}
              </a>
              <span className={styles.winnerPrize}>
                Won {parseFloat(prize).toFixed(2)} tokens
              </span>
              <span className={styles.winnerTime}>
                {endTime ? new Date(endTime).toLocaleString() : 'Unknown time'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
