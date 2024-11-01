// components/Roulette.js
import styles from './Roulette.module.css';

export default function Roulette() {
  return (
    <div className={styles.rouletteContainer}>
      <div className={styles.rouletteWheel}>
        <span className={styles.wheelIcon}>🎡</span>
      </div>
      <button className={styles.spinButton}>Spin the Wheel</button>
    </div>
  );
}
