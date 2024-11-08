import { useState, useRef, useEffect } from 'react';
import styles from './Roulette.module.css';

export default function Roulette({ players, onOpenDepositModal }) {
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [currentAngle, setCurrentAngle] = useState(0);
  const rouletteRef = useRef(null);
  const countdownRef = useRef(null);

  // Parameters of the roulette
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

  // Calculate the total deposits
  const totalDeposits = players.reduce((acc, p) => acc + p.deposit, 0);

  // Calculate the segments based on deposits
  const getSegments = () => {
    let cumulativeAngle = 0;
    return players.map((player) => {
      const tokens = player.deposit; // Number of tokens the player has deposited
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

  // Draw a segment of the roulette
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

  // Position the player names on the segments
  const renderLabels = () => {
    return segments.map((segment, index) => {
      const midAngle = segment.startAngle + segment.angle / 2;
      const radians = (Math.PI / 180) * midAngle;
      const radius = 100; // Radius for positioning the labels
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

  // Simulate an API call to determine the winning token number
  const fetchWinningTokenFromAPI = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Total number of tokens in the roulette
        const totalTokens = players.reduce((acc, p) => acc + p.deposit, 0);

        // Generate a random token number between 1 and totalTokens
        const winningToken = Math.floor(Math.random() * totalTokens) + 1;

        resolve(winningToken);
      }, 1000); // Simulate network delay of 1 second
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

        // Total angle from the start of the wheel
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
      // Simulate API call to get the winning token number
      const winningToken = await fetchWinningTokenFromAPI();

      // Get the angle corresponding to the winning token
      const { tokenAngle, winnerName } = getAngleForToken(winningToken);

      // Calculate the angle to rotate the wheel
      const spins = 15; // Number of complete rotations for effect
      const indicatorAngle = indicatorPositionAngle;

      // Calculate the current rotation of the wheel
      const currentRotation = currentAngle % 360;

      // Calculate the angle difference needed to align the winning token under the indicator
      let deltaAngle = (indicatorAngle - tokenAngle - currentRotation + 360 * 3) % 360;

      // Ensure the wheel spins at least 'spins' times
      const finalAngle = spins * 360 + deltaAngle;

      const newAngle = currentAngle + finalAngle;
      setCurrentAngle(newAngle); // Update the accumulated angle

      // Apply rotation with a longer transition for deceleration effect
      if (rouletteRef.current) {
        rouletteRef.current.style.transition =
          'transform 6s cubic-bezier(0.33, 1, 0.68, 1)';
        rouletteRef.current.style.transform = `rotate(${newAngle}deg)`;
      }

      // After the rotation, set the winner
      setTimeout(() => {
        setIsSpinning(false);
        setWinner(winnerName);
        setCountdown(30); // Reset the countdown after the spin
      }, 6000); // Duration of the spin in ms (6 seconds)
    } catch (error) {
      console.error('Error fetching the winning token:', error);
      setIsSpinning(false);
      setCountdown(30); // Reset the countdown even in case of an error
    }
  };

  // Effect for the countdown and automatically spin every 30 seconds
  useEffect(() => {
    // Only set up the countdown if not spinning
    if (!isSpinning) {
      countdownRef.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(countdownRef.current);
            handleSpin();
            return 30;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }

    // Clear the interval when the component unmounts or when spinning starts
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
      {/* Deposit Tokens Button */}
      <button
        className={styles.depositButton}
        onClick={onOpenDepositModal}
        disabled={isSpinning} // Only disabled during spinning
      >
        {isSpinning ? 'Depositing...' : 'Deposit Tokens'}
      </button>
      {/* Countdown Timer */}
      <div className={styles.countdown}>
        Next spin in: {countdown} second{countdown !== 1 ? 's' : ''}
      </div>
      {winner && (
        <div className="mt-4 text-green-500 text-xl font-semibold">
          🎉 {winner} Won!
        </div>
      )}
    </div>
  );
}
