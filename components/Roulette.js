// components/Roulette.js

import { useState, useRef, useEffect } from 'react';
import Confetti from './Confetti';
import styles from './Roulette.module.css';
import PrizePool from './PrizePool';

export default function Roulette({ onOpenDepositModal, onWinner, activeRound }) {
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [currentRoundId, setCurrentRoundId] = useState(null);
  const rouletteRef = useRef(null);

  // Atualizar jogadores quando activeRound muda
  useEffect(() => {
    if (activeRound && activeRound.participants) {
      const transformedPlayers = activeRound.participants.map((participant) => ({
        name: participant.name,
        deposit: parseFloat(participant.deposit),
        publicKey: participant.playerPublicKey,
      }));
      setPlayers(transformedPlayers);
    } else {
      setPlayers([]);
    }

    // Resetar hasSpun e currentAngle quando uma nova rodada começar
    if (activeRound && activeRound.id !== currentRoundId) {
      setHasSpun(false);
      setCurrentRoundId(activeRound.id);
      setCurrentAngle(0);
      if (rouletteRef.current) {
        rouletteRef.current.style.transition = 'none';
        rouletteRef.current.style.transform = `rotate(0deg)`;
      }
    }
  }, [activeRound]);

  // Atualizar o countdown
  useEffect(() => {
    if (activeRound && activeRound.endTime) {
      const endTime = new Date(activeRound.endTime).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeRound]);

  // Detectar mudança de status para 'waiting' e iniciar o giro
  useEffect(() => {
    if (
      activeRound &&
      activeRound.status === 'waiting' &&
      !hasSpun &&
      !isSpinning &&
      players.length > 0
    ) {
      handleSpin(activeRound);
    }
  }, [activeRound, hasSpun, isSpinning, players]);

  // Parâmetros para a roleta
  const centerX = 160;
  const centerY = 160;
  const radius = 160; // Raio da roleta

  // Ângulo e posição do indicador
  const indicatorPositionAngle = 315; // Ângulo onde o indicador está posicionado
  const indicatorAngleRadians = (indicatorPositionAngle * Math.PI) / 180;
  const indicatorX = centerX + radius * Math.cos(indicatorAngleRadians);
  const indicatorY = centerY + radius * Math.sin(indicatorAngleRadians);

  // Função para calcular a rotação do indicador
  const calculateIndicatorRotation = (x, y, centerX, centerY) => {
    const angleRadians = Math.atan2(centerY - y, centerX - x);
    const angleDegrees = angleRadians * (180 / Math.PI);
    return angleDegrees + 90; // Ajustar em 90 graus
  };

  const indicatorRotation = calculateIndicatorRotation(
    indicatorX,
    indicatorY,
    centerX,
    centerY
  );

  // Gerar cores únicas para cada jogador
  const generateColors = (num) => {
    const colors = [];
    const hueStep = Math.floor(360 / num);
    for (let i = 0; i < num; i++) {
      colors.push(`hsl(${i * hueStep}, 70%, 50%)`);
    }
    return colors;
  };

  // Calcular depósitos totais
  const totalDeposits = players.reduce((acc, p) => acc + p.deposit, 0);

  // Calcular segmentos com base nos depósitos
  const getSegments = () => {
    let cumulativeAngle = 0;
    return players.map((player) => {
      const tokens = player.deposit; // Número de tokens que o jogador depositou
      const percentage = totalDeposits > 0 ? tokens / totalDeposits : 0;
      const angle = percentage * 360;
      const segment = {
        name: player.name,
        tokens,
        percentage,
        angle,
        startAngle: cumulativeAngle % 360,
      };
      cumulativeAngle += angle;
      return segment;
    });
  };

  const segments = getSegments();
  const colors = generateColors(segments.length);

  // Renderizar um segmento da roleta
  const renderSlice = (segment, index) => {
    const { startAngle, angle } = segment;
    const endAngle = startAngle + angle;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const radius = 160; // Raio da roleta
    const centerX = 160; // Centro X
    const centerY = 160; // Centro Y

    const startRadians = (Math.PI / 180) * startAngle;
    const endRadians = (Math.PI / 180) * endAngle;

    const x1 = centerX + radius * Math.cos(startRadians);
    const y1 = centerY + radius * Math.sin(startRadians);
    const x2 = centerX + radius * Math.cos(endRadians);
    const y2 = centerY + radius * Math.sin(endRadians);

    // Define um ID único para o gradiente
    const gradientId = `gradient${index}`;

    return (
      <g key={index}>
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={colors[index]} />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
        </defs>
        <path
          d={`M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`}
          fill={`url(#${gradientId})`}
          stroke="#fff"
          strokeWidth="1"
        />
      </g>
    );
  };

  // Posicionar os nomes dos jogadores nos segmentos
  const renderLabels = () => {
    return segments.map((segment, index) => {
      const midAngle = segment.startAngle + segment.angle / 2;
      const radians = (Math.PI / 180) * midAngle;
      const radius = 100; // Raio para posicionamento do rótulo
      const x = 160 + radius * Math.cos(radians);
      const y = 160 + radius * Math.sin(radians);

      return (
        <text
          key={index}
          x={x}
          y={y}
          textAnchor="middle"
          alignmentBaseline="middle"
          className={styles.segmentText}
          transform={`rotate(${midAngle}, ${x}, ${y})`}
        >
          {segment.name}
        </text>
      );
    });
  };

  // Função para iniciar o giro da roleta
  const handleSpin = async (roundData) => {
    if (isSpinning || players.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    try {
      // Encontrar o jogador vencedor
      const winningPlayer = players.find(
        (player) => player.publicKey === roundData.winnerPublicKey
      );

      if (!winningPlayer) {
        throw new Error('Winner not found among players.');
      }

      // Calcular o ângulo para o vencedor
      const { tokenAngle } = getAngleForWinner(winningPlayer.name);

      // Calcular o ângulo de rotação
      const spins = 15;
      const indicatorAngle = indicatorPositionAngle;

      const currentRotation = currentAngle % 360;

      let deltaAngle =
        (indicatorAngle - tokenAngle - currentRotation + 360 * 3) % 360;

      const finalAngle = spins * 360 + deltaAngle;

      const newAngle = currentAngle + finalAngle;
      setCurrentAngle(newAngle);

      if (rouletteRef.current) {
        rouletteRef.current.style.transition =
          'transform 6s cubic-bezier(0.33, 1, 0.68, 1)';
        rouletteRef.current.style.transform = `rotate(${newAngle}deg)`;
      }

      setTimeout(() => {
        setIsSpinning(false);
        setWinner(winningPlayer.name);
        setShowConfetti(true);
        setHasSpun(true); // Marca que já girou para esta rodada

        if (onWinner) {
          onWinner({
            name: winningPlayer.name,
            amount: parseFloat(roundData.prize),
            time: new Date(roundData.endTime).toLocaleTimeString(),
          });
        }

        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }, 6000);
    } catch (error) {
      console.error('Error during spin:', error);
      setIsSpinning(false);
    }
  };

  // Função para obter o ângulo do vencedor
  const getAngleForWinner = (winnerName) => {
    const segment = segments.find((seg) => seg.name === winnerName);
    if (segment) {
      const tokenAngle = (segment.startAngle + segment.angle / 2) % 360;
      return { tokenAngle };
    } else {
      return { tokenAngle: 0 };
    }
  };

  // Função para formatar o countdown em mm:ss
  const formatCountdown = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes}m ${paddedSeconds}s`;
  };

  // Calcular o Prize Pool usando activeRound.prize
  const prizePool =
    activeRound && activeRound.prize
      ? parseFloat(activeRound.prize)
      : 0;

  return (
    <div className={styles.rouletteContainer}>
      <div
        className={styles.indicator}
        style={{
          left: `${indicatorX}px`,
          top: `${indicatorY}px`,
          transform: `translate(-50%, -50%) rotate(${indicatorRotation}deg)`,
        }}
      ></div>
      <svg
        className={styles.rouletteWheel}
        viewBox="0 0 320 320"
        ref={rouletteRef}
      >
        {segments.map((segment, index) => renderSlice(segment, index))}
        {renderLabels()}
        {/* Centro da roleta */}
        <circle
          cx="160"
          cy="160"
          r="40"
          className={styles.wheelCenterCircle}
        />
        <image
          x="130"
          y="130"
          width="60"
          height="60"
          href="/logo.png"
          className={styles.wheelCenterImage}
        />
      </svg>
      {/* Botão de Depósito */}
      <button
        className={styles.depositButton}
        onClick={onOpenDepositModal}
        disabled={
          isSpinning ||
          countdown <= 60 ||
          (activeRound && activeRound.status !== 'active')
        }
      >
        {isSpinning
          ? 'Spinning...'
          : countdown > 60 && activeRound && activeRound.status === 'active'
          ? 'Deposit Tokens'
          : 'Deposits Closed'}
      </button>

      {/* Mensagem de Depósitos Fechados */}
      {countdown <= 60 && activeRound && activeRound.status === 'active' && (
        <div className={styles.depositsClosedMessage}>
          Deposits are closed for the current round.
        </div>
      )}

      {/* Countdown Timer */}
      {activeRound && activeRound.status === 'active' && (
        <div className={styles.countdown}>
          Next spin in: {formatCountdown(countdown)}
        </div>
      )}

      {/* Prize Pool Component */}
      <PrizePool amount={prizePool} />

      {winner && (
        <>
          {showConfetti && <Confetti trigger={showConfetti} />}
          <div className="mt-4 text-green-500 text-xl font-semibold">
            🎉 {winner} Won!
          </div>
        </>
      )}
    </div>
  );
}
