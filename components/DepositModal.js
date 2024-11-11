// components/DepositModal.js
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
import styles from './DepositModal.module.css';

export default function DepositModal({ onClose, onDeposit }) {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { publicKey, signTransaction } = useWallet();

  // Override the connection with your custom RPC endpoint
  const customConnection = new Connection('https://mainnet.helius-rpc.com/?api-key=e9ef9f06-2e04-43ba-a91a-d1ef108c5b8c');

  // Token details and game account
  const TOKEN_MINT_ADDRESS = new PublicKey('temp'); // temp
  const GAME_ACCOUNT_PUBLIC_KEY = new PublicKey('DoFqTcawopjxLBdBhFUEQezByUipqzAmUfng93KUHjPE');
  const decimals = 6; // Your token's decimal count

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

      // Get the user's associated token account address
      const userTokenAccountAddress = await getAssociatedTokenAddress(
        TOKEN_MINT_ADDRESS,
        publicKey
      );

      // Ensure the user's token account exists
      await getAccount(customConnection, userTokenAccountAddress);

      // Get the game's associated token account address
      const gameTokenAccountAddress = await getAssociatedTokenAddress(
        TOKEN_MINT_ADDRESS,
        GAME_ACCOUNT_PUBLIC_KEY
      );

      // Check if the game's token account exists
      const gameTokenAccountInfo = await customConnection.getAccountInfo(gameTokenAccountAddress);

      if (!gameTokenAccountInfo) {
        // If it doesn't exist, create it
        transactionInstructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey, // Payer
            gameTokenAccountAddress,
            GAME_ACCOUNT_PUBLIC_KEY, // Owner of the new token account
            TOKEN_MINT_ADDRESS
          )
        );
      }

      // Calculate the amount in the smallest unit
      const amountInLamports = Math.round(amountNumber * Math.pow(10, decimals));

      // Create transfer instruction
      transactionInstructions.push(
        createTransferInstruction(
          userTokenAccountAddress, // Source account (user's token account)
          gameTokenAccountAddress, // Destination account (game's token account)
          publicKey, // Owner of the source account
          amountInLamports // Amount to transfer (in smallest units)
        )
      );

      // Create the transaction and add instructions
      const transaction = new Transaction().add(...transactionInstructions);

      // Set the transaction's fee payer and recent blockhash
      transaction.feePayer = publicKey;
      const { blockhash, lastValidBlockHeight } = await customConnection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);

      // Send the signed transaction
      const signature = await customConnection.sendRawTransaction(signedTransaction.serialize());

      // Confirm the transaction
      await customConnection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      // Update game state
      onDeposit({ name, amount: amountNumber });

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
        // User rejected the transaction in the wallet
        alert('Transaction was cancelled by the user.');
      } else {
        alert('An error occurred during the deposit. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNameChange = (e) => {
    const inputName = e.target.value.slice(0, 10); // Limit to 10 characters
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
