// utils/api.js

export async function fetchWinners() {
  try {
    const response = await fetch('https://api.thenextrich.xyz/rounds/winners');

    if (!response.ok) {
      throw new Error(`Failed to fetch winners: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    // Check if data.winners is an array
    if (Array.isArray(data.winners)) {
      return data.winners;
    } else {
      throw new Error('Invalid API response format: Expected data.winners to be an array');
    }
  } catch (error) {
    console.error('Error fetching winners:', error);
    throw error; // Re-throw the error to handle it in the component
  }
}

// utils/api.js

export async function fetchActiveRound() {
  try {
    const response = await fetch('https://api.thenextrich.xyz/rounds/active');

    if (!response.ok) {
      throw new Error(`Failed to fetch active round: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Verificar se o status é "waiting"
    if (data.status === 'waiting') {
      return { ...data, isWaiting: true };
    }

    return data; // Retornar o objeto data com as informações da rodada
  } catch (error) {
    console.error('Error fetching active round:', error);
    throw error;
  }
}
