// pages/index.js
import Head from 'next/head';
import { useState } from 'react';
import Roulette from '../components/Roulette';
import Leaderboard from '../components/Leaderboard';
import DepositModal from '../components/DepositModal';
import styles from './Home.module.css';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Home() {
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [players, setPlayers] = useState([]);

  const toggleDepositModal = () => {
    setDepositModalOpen(!isDepositModalOpen);
  };

  const handleDeposit = (player) => {
    setPlayers((prevPlayers) => {
      const existingPlayer = prevPlayers.find((p) => p.name === player.name);
      if (existingPlayer) {
        // Update existing deposit
        return prevPlayers.map((p) =>
          p.name === player.name
            ? { ...p, deposit: p.deposit + player.amount }
            : p
        );
      } else {
        // Add new player
        return [...prevPlayers, { name: player.name, deposit: player.amount }];
      }
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>The Next Rich</title>
        <meta
          name="description"
          content="A game of chance on the Solana blockchain"
        />
      </Head>

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>💰 The Next Rich</h1>
        <div className={styles.buttonGroup}>
          <button onClick={toggleDepositModal} className={styles.depositButton}>
            Deposit Tokens
          </button>
          <WalletMultiButton className={styles.connectButton} />
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <Roulette players={players} />
        <Leaderboard players={players} />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} The Next Rich. All rights reserved.
      </footer>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <DepositModal onClose={toggleDepositModal} onDeposit={handleDeposit} />
      )}
    </div>
  );
}
