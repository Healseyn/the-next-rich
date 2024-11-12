// components/Roulette.js
import { useState, useRef, useEffect } from 'react';
import Confetti from './Confetti';
import styles from './Roulette.module.css';

export default function Roulette({ players, onOpenDepositModal, onWinner, setPlayers }) {
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState(1800); // 30 minutes in seconds
  const [currentAngle, setCurrentAngle] = useState(0);
  const rouletteRef = useRef(null);
  const countdownRef = useRef(null);

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

  // Simulate API call to determine the winning token
  const fetchWinningTokenFromAPI = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Total tokens in the roulette
        const totalTokens = players.reduce((acc, p) => acc + p.deposit, 0);

        // Generate a random number between 1 and totalTokens
        const winningToken = Math.floor(Math.random() * totalTokens) + 1;

        resolve(winningToken);
      }, 1000); // Simulate 1-second delay
    });
  };

  // Function to map the winning token to an angle
  const getAngleForToken = (tokenNumber) => {
    let cumulativeTokens = 0;

    for (let segment of segments) {
      cumulativeTokens += segment.tokens; // Number of tokens in the segment

      if (tokenNumber <= cumulativeTokens) {
        // Token is within this segment
        const tokenInSegment = tokenNumber - (cumulativeTokens - segment.tokens);
        const tokenPercentage = tokenInSegment / segment.tokens;

        // Calculate the angle within the segment
        const angleWithinSegment = tokenPercentage * segment.angle;

        // Total angle from the start of the roulette
        const tokenAngle = (segment.startAngle + angleWithinSegment) % 360;

        return { tokenAngle, winnerName: segment.name };
      }
    }

    // Fallback in case something goes wrong
    return { tokenAngle: 0, winnerName: null };
  };

  // Function to spin the roulette using the simulated API call
  const handleSpin = async () => {
    if (isSpinning || players.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    try {
      // Simulate API call to get the winning token
      const winningToken = await fetchWinningTokenFromAPI();

      // Get the angle corresponding to the winning token
      const { tokenAngle, winnerName } = getAngleForToken(winningToken);

      // Calculate the angle to spin the roulette
      const spins = 15; // Number of complete rotations for effect
      const indicatorAngle = indicatorPositionAngle;

      // Calculate the current rotation angle of the roulette
      const currentRotation = currentAngle % 360;

      // Calculate the angle difference needed to align the winning token under the indicator
      let deltaAngle =
        (indicatorAngle - tokenAngle - currentRotation + 360 * 3) % 360;

      // Ensure the roulette spins at least 'spins' times
      const finalAngle = spins * 360 + deltaAngle;

      const newAngle = currentAngle + finalAngle;
      setCurrentAngle(newAngle); // Update the cumulative angle

      // Apply rotation with smooth transition
      if (rouletteRef.current) {
        rouletteRef.current.style.transition =
          'transform 6s cubic-bezier(0.33, 1, 0.68, 1)';
        rouletteRef.current.style.transform = `rotate(${newAngle}deg)`;
      }

      // After the rotation, set the winner and display confetti
      setTimeout(() => {
        setIsSpinning(false);
        setWinner(winnerName);
        setCountdown(1800); // Reset countdown to 30 minutes
        setShowConfetti(true);

        // Calculate total deposits and prize (80% of total)
        const totalDeposits = players.reduce((acc, p) => acc + p.deposit, 0);
        const prizeAmount = totalDeposits * 0.8;

        // Pass the winner to the main page
        if (onWinner) {
          onWinner({
            name: winnerName,
            amount: prizeAmount.toFixed(2),
            time: new Date().toLocaleTimeString(),
          });
        }

        // Reset the deposits (clear players)
        setPlayers([]);

        // Stop confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }, 6000); // Duration of the rotation in ms (6 seconds)
    } catch (error) {
      console.error('Error obtaining the winning token:', error);
      setIsSpinning(false);
      setCountdown(1800); // Reset countdown to 30 minutes even in case of error
    }
  };

  // Function to format countdown into mm:ss
  const formatCountdown = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes}m ${paddedSeconds}s`;
  };

  // Effect for the countdown timer (30 minutes)
  useEffect(() => {
    // Only set up the countdown if not spinning
    if (!isSpinning) {
      countdownRef.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(countdownRef.current);
            handleSpin();
            return 1800; // Reset to 30 minutes after spinning
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }

    // Cleanup interval on component unmount or when spinning starts
    return () => clearInterval(countdownRef.current);
  }, [isSpinning, segments.length]);

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
