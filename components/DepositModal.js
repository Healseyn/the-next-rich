// components/DepositModal.js
import { useState } from 'react';
import styles from './DepositModal.module.css';

export default function DepositModal({ onClose }) {
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    // Lógica de depósito
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Deposit Tokens</h2>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.input}
        />
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleDeposit} className={styles.confirmButton}>
            Confirm Deposit
          </button>
        </div>
      </div>
    </div>
  );
}
