// components/Leaderboard.js
import styles from './Leaderboard.module.css';

export default function Leaderboard({ players }) {
  const totalDeposits = players.reduce((acc, player) => acc + player.deposit, 0);

  return (
    <div className={styles.leaderboard}>
      <h2 className={styles.title}>Depósitos Atuais</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Jogador</th>
              <th>Depósito</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index}>
                <td>{player.name}</td>
                <td>{player.deposit} tokens</td>
                <td>
                  {totalDeposits > 0
                    ? ((player.deposit / totalDeposits) * 100).toFixed(2) + '%'
                    : '0%'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
