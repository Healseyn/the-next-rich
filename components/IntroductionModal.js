// components/IntroductionModal.js
import { useState } from 'react';
import styles from './IntroductionModal.module.css';

export default function IntroductionModal({ onClose }) {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        {step === 1 && (
          <>
            <h2>Welcome to The Next Rich!</h2>
            <p>
              Discover how to play and buy tokens on pump.fun. Start by connecting your wallet and exploring our features.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <h2>How to Play</h2>
            <p>
              Participate by depositing tokens. Each deposit increases your chances of winning in the roulette!
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Let&apos;s Get Started!</h2>
            <p>
              Buy tokens on pump.fun. Click the &apos;Buy Tokens&apos; button to get started!
            </p>
            <img
              src="https://media.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif"
              alt="Excited"
              className={styles.gif}
            />
          </>
        )}
        <div className={styles.buttonGroup}>
          <button onClick={handleNext} className={styles.nextButton}>
            {step < TOTAL_STEPS ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
}