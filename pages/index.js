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

// Importação dinâmica do WalletMultiButton
const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function Home() {
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [players, setPlayers] = useState([]);
  const [winners, setWinners] = useState([]);

  // Simular chamada à API para buscar ganhadores antigos
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
        // Atualizar depósito existente
        return prevPlayers.map((p) =>
          p.name === player.name
            ? { ...p, deposit: p.deposit + player.amount }
            : p
        );
      } else {
        // Adicionar novo jogador
        return [...prevPlayers, { name: player.name, deposit: player.amount }];
      }
    });
  };

  const handleBuyTokens = () => {
    window.open('https://example.com/buy-tokens', '_blank'); // Substitua pela URL real
  };

  const handleNewWinner = (winner) => {
    setWinners((prevWinners) => [winner, ...prevWinners]);
    setPlayers([]); // Limpar jogadores após a rotação
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

      {/* Cabeçalho */}
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

      {/* Conteúdo Principal */}
      <main className={styles.main}>
        <Roulette
          players={players}
          onOpenDepositModal={toggleDepositModal}
          onWinner={handleNewWinner}
          setPlayers={setPlayers} // Certifique-se de passar setPlayers se necessário
        />
        <Leaderboard players={players} />
        <LastWinners winners={winners} />
      </main>

      {/* Rodapé */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} The Next Rich. All rights reserved.
      </footer>

      {/* Modal de Depósito */}
      {isDepositModalOpen && (
        <DepositModal onClose={toggleDepositModal} onDeposit={handleDeposit} />
      )}
    </div>
  );
}
