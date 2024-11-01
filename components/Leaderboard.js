// components/Leaderboard.js
import styles from './Leaderboard.module.css';

export default function Leaderboard() {
  const players = [
    { name: 'Player1', deposit: 50, chance: '30%' },
    { name: 'Player2', deposit: 30, chance: '20%' },
    { name: 'Player3', deposit: 20, chance: '10%' },
    { name: 'Player4', deposit: 10, chance: '5%' },
  ];

  return (
    <div className={styles.leaderboard}>
      <h2 className={styles.title}>Current Deposits</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Deposit</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index}>
                <td>{player.name}</td>
                <td>{player.deposit} tokens</td>
                <td>{player.chance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
