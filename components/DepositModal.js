// components/DepositModal.js
import { useState } from 'react';
import styles from './DepositModal.module.css';

export default function DepositModal({ onClose, onDeposit }) {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');

  const handleDeposit = () => {
    if (name.trim() === '' || amount <= 0) {
      alert('Por favor, insira um nome válido e um valor de depósito.');
      return;
    }
    onDeposit({ name, amount: parseInt(amount, 10) });
    onClose();
  };

  const handleNameChange = (e) => {
    const inputName = e.target.value.slice(0, 10); // Limita a 10 caracteres
    setName(inputName);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Depositar Tokens</h2>
        <input
          type="text"
          placeholder="Seu Nome (máx 10 caracteres)"
          value={name}
          onChange={handleNameChange}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.input}
        />
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleDeposit} className={styles.confirmButton}>
            Confirmar Depósito
          </button>
        </div>
      </div>
    </div>
  );
}
