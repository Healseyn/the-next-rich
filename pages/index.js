// pages/index.js
import Head from 'next/head';
import { useState } from 'react';
import Roulette from '../components/Roulette';
import Leaderboard from '../components/Leaderboard';
import DepositModal from '../components/DepositModal';
import styles from './Home.module.css';

export default function Home() {
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);

  const toggleDepositModal = () => {
    setDepositModalOpen(!isDepositModalOpen);
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
        <button onClick={toggleDepositModal} className={styles.depositButton}>
          Deposit Tokens
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <Roulette />
        <Leaderboard />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} The Next Rich. All rights reserved.
      </footer>

      {/* Deposit Modal */}
      {isDepositModalOpen && <DepositModal onClose={toggleDepositModal} />}
    </div>
  );
}
