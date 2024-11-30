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
import Cookies from 'js-cookie';
import IntroductionModal from '../components/IntroductionModal';
import { fetchActiveRound, fetchWinners } from '../utils/api';

// Dynamic import of WalletMultiButton
const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// Import React Icons
import { FaDiscord, FaBook, FaTwitter } from 'react-icons/fa';
import PumpFunIcon from '../public/pumpfunicon.png';

export default function Home() {
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [players, setPlayers] = useState([]);
  const [winners, setWinners] = useState([]);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  const [hasSpun, setHasSpun] = useState(false); // Controls if the roulette has spun

  useEffect(() => {
    const loadWinners = async () => {
      try {
        const historicalWinners = await fetchWinners();
        setWinners(historicalWinners.winners || historicalWinners); // Update winners state
      } catch (error) {
        console.error('Error loading winners:', error);
      }
    };

    loadWinners(); // Fetch winners only once when the page loads
  }, []);

  useEffect(() => {
    const loadActiveRound = async () => {
      try {
        const round = await fetchActiveRound();
        setActiveRound(round);

        if (round.participants && Array.isArray(round.participants)) {
          const transformedPlayers = round.participants.map((participant) => ({
            name: participant.name,
            deposit: parseFloat(participant.deposit),
            publicKey: participant.playerPublicKey,
          }));

          setPlayers(transformedPlayers);
        } else {
          setPlayers([]);
        }

        // Reset hasSpun if the round changes
        if (activeRound && round.id !== activeRound.id) {
          setHasSpun(false);
        }
      } catch (error) {
        console.error('Error loading active round:', error);
      }
    };
    const interval = setInterval(() => {
      loadActiveRound(); // Periodically update active round
    }, 5000);

    return () => clearInterval(interval);
  }, [activeRound]);

  useEffect(() => {
    const hasVisited = Cookies.get('hasVisited');
    if (!hasVisited) {
      setShowIntroModal(true);
      Cookies.set('hasVisited', 'true', { expires: 365 });
    }
  }, []);

  const toggleDepositModal = () => {
    setDepositModalOpen(!isDepositModalOpen);
  };

  const handleDeposit = (player) => {
    setPlayers((prevPlayers) => {
      const existingPlayer = prevPlayers.find((p) => p.name === player.name);
      if (existingPlayer) {
        return prevPlayers.map((p) =>
          p.name === player.name
            ? { ...p, deposit: p.deposit + player.amount }
            : p
        );
      } else {
        return [...prevPlayers, { name: player.name, deposit: player.amount }];
      }
    });
  };

  const handleBuyTokens = () => {
    window.open('https://pump.fun/coin/KSNntrnj3rdYJxWDjhMYPXig14MP5Dms7id3f95pump', '_blank');
  };

  const handleNewWinner = async () => {
    setHasSpun(true); // Mark that the spin has been completed

    // Reload winners to include the new winner
    try {
      const latestWinners = await fetchWinners();
      setWinners(latestWinners.winners || latestWinners);
    } catch (error) {
      console.error('Error fetching winners:', error);
    }

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

      {showIntroModal && (
        <IntroductionModal onClose={() => setShowIntroModal(false)} />
      )}

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
          setPlayers={setPlayers}
          activeRound={activeRound}
          hasSpun={hasSpun} // Pass hasSpun to Roulette
        />
        <Leaderboard players={players} />
        <LastWinners
          winners={winners.filter((winner) => winner.id !== activeRound?.id)} // Exclude the current round winner
          activeRound={activeRound}
          hasSpun={hasSpun}
        />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span>
            © {new Date().getFullYear()} The Next Rich. All rights reserved.
          </span>

          {/* Additional text */}
          <div className={styles.madeWithLove}>
            made with ❤️ by{' '}
            <a
              href="https://github.com/Healseyn"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Healseyn
            </a>
          </div>

          <div className={styles.footerLinks}>
            <a
              href="https://discord.gg/PDWypMJqXH"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
              aria-label="Join our Discord server"
            >
              <FaDiscord size={20} />
              <span className={styles.linkText}>Discord</span>
            </a>
            <a
              href="https://docs.thenextrich.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
              aria-label="View our Documentation"
            >
              <FaBook size={20} />
              <span className={styles.linkText}>Docs</span>
            </a>
            <a
              href="https://pump.fun/coin/KSNntrnj3rdYJxWDjhMYPXig14MP5Dms7id3f95pump"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
              aria-label="Visit Pump.fun"
            >
              <Image src={PumpFunIcon} alt="Pump.fun" width={20} height={20} />
              <span className={styles.linkText}>Pump.fun</span>
            </a>
            <a
              href="https://x.com/TheNextRichSol"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
              aria-label="Follow us on Twitter"
            >
              <FaTwitter size={20} />
              <span className={styles.linkText}>Twitter</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <DepositModal
          onClose={toggleDepositModal}
          onDeposit={handleDeposit}
          activeRound={activeRound}
        />
      )}
    </div>
  );
}
