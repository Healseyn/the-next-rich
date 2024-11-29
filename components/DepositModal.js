// components/DepositModal.js
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
import styles from './DepositModal.module.css';

export default function DepositModal({ onClose, onDeposit, activeRound }) {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { publicKey, signTransaction } = useWallet();

  // Obter as variáveis de ambiente
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
  const TOKEN_MINT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS);
  const GAME_ACCOUNT_PUBLIC_KEY = new PublicKey(process.env.NEXT_PUBLIC_GAME_ACCOUNT_PUBLIC_KEY);
  const MEMO_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MEMO_PROGRAM_ID);
  const decimals = parseInt(process.env.NEXT_PUBLIC_TOKEN_DECIMALS, 10);

  const customConnection = new Connection(RPC_URL);

  const handleDeposit = async () => {
    if (!publicKey || !signTransaction) {
      alert('Please connect your wallet.');
      return;
    }

    if (name.trim() === '') {
      alert('Please enter a valid name.');
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    setIsProcessing(true);

    try {
      const transactionInstructions = [];

      const userTokenAccountAddress = await getAssociatedTokenAddress(
        TOKEN_MINT_ADDRESS,
        publicKey
      );

      await getAccount(customConnection, userTokenAccountAddress);

      const gameTokenAccountAddress = await getAssociatedTokenAddress(
        TOKEN_MINT_ADDRESS,
        GAME_ACCOUNT_PUBLIC_KEY
      );

      const gameTokenAccountInfo = await customConnection.getAccountInfo(gameTokenAccountAddress);

      if (!gameTokenAccountInfo) {
        transactionInstructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey,
            gameTokenAccountAddress,
            GAME_ACCOUNT_PUBLIC_KEY,
            TOKEN_MINT_ADDRESS
          )
        );
      }

      const amountInLamports = Math.round(amountNumber * Math.pow(10, decimals));

      transactionInstructions.push(
        createTransferInstruction(
          userTokenAccountAddress,
          gameTokenAccountAddress,
          publicKey,
          amountInLamports
        )
      );

      // Adicionar a instrução de memo com o nome do usuário
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(name, 'utf-8'), // Adiciona o nome do usuário como memo
      });
      transactionInstructions.push(memoInstruction);

      const transaction = new Transaction().add(...transactionInstructions);

      transaction.feePayer = publicKey;
      const { blockhash, lastValidBlockHeight } = await customConnection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);

      const signature = await customConnection.sendRawTransaction(signedTransaction.serialize());

      await customConnection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      onDeposit({ name, deposit: amountNumber }); // Update the state of players

      alert(`Transaction successful! Signature: ${signature}`);
      onClose();
    } catch (error) {
      console.error('Error during deposit:', error);

      if (
        error.code === 4001 ||
        (error.message && (
          error.message.includes('User rejected') ||
          error.message.includes('Transaction was rejected') ||
          error.message.includes('The request was rejected by the server') ||
          error.message.includes('Transaction cancelled')
        ))
      ) {
        alert('Transaction was cancelled by the user.');
      } else {
        alert('An error occurred during the deposit. The transaction may have failed due to network congestion or other issues. Please try again later.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNameChange = (e) => {
    const inputName = e.target.value.slice(0, 10);
    setName(inputName);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Deposit Tokens</h2>
        <input
          type="text"
          placeholder="Your Name (max 10 characters)"
          value={name}
          onChange={handleNameChange}
          className={styles.input}
        />
        <input
          type="number"
          step="any"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.input}
        />
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancelButton} disabled={isProcessing}>
            Cancel
          </button>
          <button onClick={handleDeposit} className={styles.confirmButton} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Confirm Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
}
