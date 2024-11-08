// components/Confetti.js
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const Confetti = ({ trigger }) => {
  useEffect(() => {
    if (trigger) {
      // Configurações do confete
      const duration = 5 * 1000; // 5 segundos
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Lança confete de origens aleatórias
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: {
              x: Math.random(),
              // Randomiza a direção do confete (para cima ou para baixo)
              y: Math.random() - 0.2,
            },
          })
        );
      }, 250);

      // Limpa o intervalo ao desmontar o componente
      return () => clearInterval(interval);
    }
  }, [trigger]);

  return null;
};

export default Confetti;
