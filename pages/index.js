// pages/index.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Roulette from '../components/Roulette';
import Leaderboard from '../components/Leaderboard';
import LastWinners from '../components/LastWinners';
import DepositModal from '../components/DepositModal';
import styles from './Home.module.css';

// Dynamic import of WalletMultiButton
const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// Import React Icons
import { FaDiscord, FaBook } from 'react-icons/fa';

export default function Home() {
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [players, setPlayers] = useState([]);
  const [winners, setWinners] = useState([]);

  // Simulate API call to fetch past winners
  const fetchWinnersFromAPI = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const historicalWinners = [
          { name: 'Alice', amount: 500, time: '10:30 AM' },
          { name: 'Bob', amount: 300, time: '11:00 AM' },
          { name: 'Charlie', amount: 700, time: '11:30 AM' },
        ];
        resolve(historicalWinners);
      }, 1000);
    });
  };

  useEffect(() => {
    const loadWinners = async () => {
      const historicalWinners = await fetchWinnersFromAPI();
      setWinners(historicalWinners);
    };

    loadWinners();
  }, []);

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

  const handleBuyTokens = () => {
    window.open('https://example.com/buy-tokens', '_blank'); // Replace with your actual URL
  };

  const handleNewWinner = (winner) => {
    setWinners((prevWinners) => [winner, ...prevWinners]);
    setPlayers([]); // Clear players after the spin
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
        <div className={styles.logoContainer}>
          <Image
            src="/logo.png"
            alt="The Next Rich Logo"
            width={50}
            height={50}
          />
          <h1 className={styles.title}>The Next Rich</h1>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={handleBuyTokens} className={styles.depositButton}>
            Buy Tokens
          </button>
          <WalletMultiButton className={styles.connectButton} />
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <Roulette
          players={players}
          onOpenDepositModal={toggleDepositModal}
          onWinner={handleNewWinner}
          setPlayers={setPlayers} // Ensure to pass setPlayers if needed
        />
        <Leaderboard players={players} />
        <LastWinners winners={winners} />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span>© {new Date().getFullYear()} The Next Rich. All rights reserved.</span>
          <div className={styles.footerLinks}>
            <a
              href="https://discord.gg/PDWypMJqXH" // Replace with your Discord invite link
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
              aria-label="Join our Discord server"
            >
              <FaDiscord size={20} />
              <span className={styles.linkText}>Discord</span>
            </a>
            <a
              href="/docs" // Replace with your actual documentation URL
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
              aria-label="View our Documentation"
            >
              <FaBook size={20} />
              <span className={styles.linkText}>Docs</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <DepositModal onClose={toggleDepositModal} onDeposit={handleDeposit} />
      )}
    </div>
  );
}
