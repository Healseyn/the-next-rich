// components/Roulette.js
import { useState, useRef, useEffect } from 'react';
import Confetti from './Confetti'; // Importar o componente Confetti
import styles from './Roulette.module.css';

export default function Roulette({ players, onOpenDepositModal }) {
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false); // Estado para controlar o confete
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [currentAngle, setCurrentAngle] = useState(0);
  const rouletteRef = useRef(null);
  const countdownRef = useRef(null);

  // Parâmetros da roleta
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
    return angleDegrees + 90; // Ajuste de 90 graus
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

  // Calcular o total de depósitos
  const totalDeposits = players.reduce((acc, p) => acc + p.deposit, 0);

  // Calcular os segmentos com base nos depósitos
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

  // Desenhar um segmento da roleta
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

    // Definir um ID único para o gradiente
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
      const radius = 100; // Raio para posicionar os rótulos
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

  // Simular uma chamada API para determinar o número do token vencedor
  const fetchWinningTokenFromAPI = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Total de tokens na roleta
        const totalTokens = players.reduce((acc, p) => acc + p.deposit, 0);

        // Gerar um número de token aleatório entre 1 e totalTokens
        const winningToken = Math.floor(Math.random() * totalTokens) + 1;

        resolve(winningToken);
      }, 1000); // Simular delay de rede de 1 segundo
    });
  };

  // Função para mapear o token vencedor a um ângulo
  const getAngleForToken = (tokenNumber) => {
    let cumulativeTokens = 0;

    for (let segment of segments) {
      cumulativeTokens += segment.tokens; // Número de tokens no segmento

      if (tokenNumber <= cumulativeTokens) {
        // Token está dentro deste segmento
        const tokenInSegment = tokenNumber - (cumulativeTokens - segment.tokens);
        const tokenPercentage = tokenInSegment / segment.tokens;

        // Calcular o ângulo dentro do segmento
        const angleWithinSegment = tokenPercentage * segment.angle;

        // Ângulo total a partir do início da roleta
        const tokenAngle = (segment.startAngle + angleWithinSegment) % 360;

        return { tokenAngle, winnerName: segment.name };
      }
    }

    // Fallback caso algo dê errado
    return { tokenAngle: 0, winnerName: null };
  };

  // Função para girar a roleta utilizando a chamada API simulada
  const handleSpin = async () => {
    if (isSpinning || players.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    try {
      // Simular chamada API para obter o número do token vencedor
      const winningToken = await fetchWinningTokenFromAPI();

      // Obter o ângulo correspondente ao token vencedor
      const { tokenAngle, winnerName } = getAngleForToken(winningToken);

      // Calcular o ângulo para girar a roleta
      const spins = 15; // Número de rotações completas para efeito
      const indicatorAngle = indicatorPositionAngle;

      // Calcular a rotação atual da roleta
      const currentRotation = currentAngle % 360;

      // Calcular a diferença de ângulo necessária para alinhar o token vencedor sob o indicador
      let deltaAngle =
        (indicatorAngle - tokenAngle - currentRotation + 360 * 3) % 360;

      // Garantir que a roleta gire pelo menos 'spins' vezes
      const finalAngle = spins * 360 + deltaAngle;

      const newAngle = currentAngle + finalAngle;
      setCurrentAngle(newAngle); // Atualizar o ângulo acumulado

      // Aplicar rotação com transição mais longa para desaceleração
      if (rouletteRef.current) {
        rouletteRef.current.style.transition =
          'transform 6s cubic-bezier(0.33, 1, 0.68, 1)';
        rouletteRef.current.style.transform = `rotate(${newAngle}deg)`;
      }

      // Após a rotação, definir o vencedor e mostrar o confete
      setTimeout(() => {
        setIsSpinning(false);
        setWinner(winnerName);
        setCountdown(30); // Resetar o countdown após o giro
        setShowConfetti(true); // Mostrar confete

        // Parar o confete após 30 segundos
        setTimeout(() => {
          setShowConfetti(false);
        }, 30000);
      }, 6000); // Duração do giro em ms (6 segundos)
    } catch (error) {
      console.error('Erro ao buscar o token vencedor:', error);
      setIsSpinning(false);
      setCountdown(30); // Resetar o countdown mesmo em caso de erro
    }
  };

  // Efeito para o countdown e girar automaticamente a cada 30 segundos
  useEffect(() => {
    // Apenas configurar o countdown se não estiver girando
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

    // Limpar o intervalo ao desmontar o componente ou quando iniciar um giro
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
        {/* Centro da roleta */}
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
      {/* Botão de Depositar Tokens */}
      <button
        className={styles.depositButton}
        onClick={onOpenDepositModal}
        disabled={isSpinning} // Apenas desabilitado durante o giro
      >
        {isSpinning ? 'Depositando...' : 'Depositar Tokens'}
      </button>
      {/* Timer de Countdown */}
      <div className={styles.countdown}>
        Próximo giro em: {countdown} segundo{countdown !== 1 ? 's' : ''}
      </div>
      {winner && (
        <>
          {showConfetti && <Confetti trigger={showConfetti} />}
          <div className="mt-4 text-green-500 text-xl font-semibold">
            🎉 {winner} Ganhou!
          </div>
        </>
      )}
    </div>
  );
}
