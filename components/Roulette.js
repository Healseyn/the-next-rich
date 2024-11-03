// components/Roulette.js
import { useState, useRef } from 'react';
import styles from './Roulette.module.css';

export default function Roulette({ players }) {
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const rouletteRef = useRef(null);

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
      const percentage = totalDeposits > 0 ? player.deposit / totalDeposits : 0;
      const angle = percentage * 360;
      const segment = {
        name: player.name,
        percentage,
        angle,
        startAngle: cumulativeAngle,
      };
      cumulativeAngle += angle;
      return segment;
    });
  };

  const segments = getSegments();
  const colors = generateColors(segments.length);

  // Draw a slice of the roulette
  const renderSlice = (segment, index) => {
    const { startAngle, angle } = segment;
    const endAngle = startAngle + angle;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const radius = 160; // Radius of the roulette
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

  // Position player names within their segments
  const renderLabels = () => {
    return segments.map((segment, index) => {
      const midAngle = segment.startAngle + segment.angle / 2;
      const radians = (Math.PI / 180) * midAngle;
      const radius = 100; // Radius for positioning labels
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

  // Spin function with random results for testing
  const handleSpin = () => {
    if (isSpinning || players.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // Select a random winner for testing
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = segments[randomIndex];

    // Calculate the final angle for rotation
    const spins = 5; // Number of complete spins
    const finalAngle =
      360 * spins + (360 - (selectedPlayer.startAngle + selectedPlayer.angle / 2));

    // Apply rotation
    if (rouletteRef.current) {
      rouletteRef.current.style.transition = 'transform 4s ease-out';
      rouletteRef.current.style.transform = `rotate(${finalAngle}deg)`;
    }

    // After rotation, set the winner
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(selectedPlayer.name);
      // Reset the roulette position
      if (rouletteRef.current) {
        rouletteRef.current.style.transition = 'none';
        rouletteRef.current.style.transform = `rotate(${finalAngle % 360}deg)`;
      }
    }, 4000); // Duration of the spin in ms
  };

  return (
    <div className={styles.rouletteContainer}>
      <div className={styles.indicator}></div>
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
        <text
          x="160"
          y="160"
          textAnchor="middle"
          alignmentBaseline="middle"
          className={styles.wheelIcon}
        >
          🎰
        </text>
      </svg>
      <button
        className={styles.spinButton}
        onClick={handleSpin}
        disabled={isSpinning || players.length === 0}
      >
        {isSpinning ? 'Girando...' : 'Girar a Roleta'}
      </button>
      {winner && (
        <div className="mt-4 text-green-500 text-xl font-semibold">
          🎉 {winner} venceu!
        </div>
      )}
    </div>
  );
}
