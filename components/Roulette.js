import { useState, useRef, useEffect } from 'react';
import Confetti from './Confetti';
import styles from './Roulette.module.css';
import { fetchRoundResult } from '../utils/api'; // Import the function
import PrizePool from './PrizePool'; // Importar o componente PrizePool

export default function Roulette({ players, onOpenDepositModal, onWinner, setPlayers, activeRound }) {
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState(null); // Initially null
  const [currentAngle, setCurrentAngle] = useState(0);
  const rouletteRef = useRef(null);
  const countdownRef = useRef(null);

  // Update players when activeRound changes
  useEffect(() => {
    if (activeRound && activeRound.participants) {
      const transformedPlayers = activeRound.participants.map((participant) => ({
        name: participant.name,
        deposit: parseFloat(participant.deposit),
        publicKey: participant.publicKey, // Added publicKey
      }));
      setPlayers(transformedPlayers);
    }
  }, [activeRound]);

  // Parameters for the roulette
  const centerX = 160;
  const centerY = 160;
  const radius = 160; // Radius of the roulette

  // Angle and position of the indicator
  const indicatorPositionAngle = 315; // Angle where the indicator is positioned
  const indicatorAngleRadians = (indicatorPositionAngle * Math.PI) / 180;
  const indicatorX = centerX + radius * Math.cos(indicatorAngleRadians);
  const indicatorY = centerY + radius * Math.sin(indicatorAngleRadians);

  // Function to calculate the rotation of the indicator
  const calculateIndicatorRotation = (x, y, centerX, centerY) => {
    const angleRadians = Math.atan2(centerY - y, centerX - x);
    const angleDegrees = angleRadians * (180 / Math.PI);
    return angleDegrees + 90; // Adjust by 90 degrees
  };

  const indicatorRotation = calculateIndicatorRotation(
    indicatorX,
    indicatorY,
    centerX,
    centerY
  );

  // Generate unique colors for each player
  const generateColors = (num) => {
    const colors = [];
    const hueStep = Math.floor(360 / num);
    for (let i = 0; i < num; i++) {
      colors.push(`hsl(${i * hueStep}, 70%, 50%)`);
    }
    return colors;
  };

  // Calculate total deposits
  const totalDeposits = players.reduce((acc, p) => acc + p.deposit, 0);

  // Calculate segments based on deposits
  const getSegments = () => {
    let cumulativeAngle = 0;
    return players.map((player) => {
      const tokens = player.deposit; // Number of tokens the player deposited
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

  // Render a segment of the roulette
  const renderSlice = (segment, index) => {
    const { startAngle, angle } = segment;
    const endAngle = startAngle + angle;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const radius = 160; // Roulette radius
    const centerX = 160; // Center X
    const centerY = 160; // Center Y

    const startRadians = (Math.PI / 180) * startAngle;
    const endRadians = (Math.PI / 180) * endAngle;

    const x1 = centerX + radius * Math.cos(startRadians);
    const y1 = centerY + radius * Math.sin(startRadians);
    const x2 = centerX + radius * Math.cos(endRadians);
    const y2 = centerY + radius * Math.sin(endRadians);

    // Define a unique ID for the gradient
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

  // Position player names on the segments
  const renderLabels = () => {
    return segments.map((segment, index) => {
      const midAngle = segment.startAngle + segment.angle / 2;
      const radians = (Math.PI / 180) * midAngle;
      const radius = 100; // Radius for label positioning
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

  // Update countdown to use API-provided endTime
  useEffect(() => {
    if (activeRound && activeRound.endTime) {
      const endTime = new Date(activeRound.endTime).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(interval);
          handleSpin(); // Start spin when time is up
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeRound]);

  // Function to spin the roulette using the simulated API call
  const handleSpin = async () => {
    if (isSpinning || players.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    try {
      // Obtain round result from API
      const result = await fetchRoundResult(activeRound.id);

      // Find winning player
      const winningPlayer = players.find(
        (player) => player.publicKey === result.winnerPublicKey
      );

      if (!winningPlayer) {
        throw new Error('Winner not found among players.');
      }

      // Calculate angle for winner
      const { tokenAngle } = getAngleForWinner(winningPlayer.name);

      // Calculate rotation angle
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

        if (onWinner) {
          onWinner({
            name: winningPlayer.name,
            amount: parseFloat(result.prize),
            time: new Date(result.endTime).toLocaleTimeString(),
          });
        }

        setPlayers([]);

        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }, 6000);
    } catch (error) {
      console.error('Error during spin:', error);
      setIsSpinning(false);
    }
  };

  // Function to format countdown into mm:ss
  const formatCountdown = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes}m ${paddedSeconds}s`;
  };

  // Create fetchRoundResult function
  const fetchRoundResult = async (roundId) => {
    try {
      const response = await fetch(`https://api.thenextrich.xyz/rounds/${roundId}/result`);

      if (!response.ok) {
        throw new Error(`Failed to fetch round result: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching round result:', error);
      throw error;
    }
  };

  // Update getAngleForWinner function
  const getAngleForWinner = (winnerName) => {
    const segment = segments.find((seg) => seg.name === winnerName);
    if (segment) {
      const tokenAngle = (segment.startAngle + segment.angle / 2) % 360;
      return { tokenAngle };
    } else {
      return { tokenAngle: 0 };
    }
  };

  // Calculate the Prize Pool using activeRound.prize
  const prizePool = activeRound && activeRound.prize ? parseFloat(activeRound.prize) : 0;

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
        {/* Center of the roulette */}
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
      {/* Deposit Tokens Button */}
      <button
        className={styles.depositButton}
        onClick={onOpenDepositModal}
        disabled={isSpinning} // Disabled during spinning
      >
        {isSpinning ? 'Depositing...' : 'Deposit Tokens'}
      </button>
      {/* Countdown Timer */}
      <div className={styles.countdown}>
        Next spin in: {formatCountdown(countdown)}
      </div>
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
