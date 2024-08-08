// historicalDataWorker.ts

self.addEventListener('message', (event) => {
  try {
    const { prices, balance } = event.data;
    
    if (!Array.isArray(prices) || typeof balance !== 'number') {
      throw new Error('Invalid input data');
    }

    console.log('Worker received data:', { pricesLength: prices.length, balance });

    const historicalData = prices.map(([timestamp, price]: [number, number]) => {
      if (typeof timestamp !== 'number' || typeof price !== 'number') {
        throw new Error('Invalid price data');
      }
      const date = new Date(timestamp).toLocaleDateString();
      const value = parseFloat((price * balance).toFixed(2));
      return { date, value };
    });

    console.log('Worker processed data:', { dataLength: historicalData.length, firstItem: historicalData[0], lastItem: historicalData[historicalData.length - 1] });

    self.postMessage(historicalData);
  } catch (error) {
    console.error('Error in worker:', error);
    self.postMessage({ error: error.message });
  }
});

export {};