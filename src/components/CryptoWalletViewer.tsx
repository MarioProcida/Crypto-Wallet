import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, Search, Sun, Moon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cacheService } from '../services/cacheService';
import Worker from '../workers/historicalDataWorker?worker';
import { useTheme } from '../context/ThemeContext';
import { AnimatedDiv, AnimatedButton, fadeIn, slideIn } from './AnimatedComponents';
import AssetDistribution from './AssetDistribution';
import PerformanceOverTime from './PerformanceOverTime';
import PortfolioMetrics from './PortfolioMetrics';

const BLOCKCHAIN_API = 'https://blockchain.info/rawaddr/';
const ETHERSCAN_API = 'https://api.etherscan.io/api';
const SOLSCAN_API = 'https://public-api.solscan.io/account/';
const POLKADOT_API = 'https://polkadot.api.subscan.io/api/v2/scan/account';
const SUI_API = 'https://fullnode.mainnet.sui.io/';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const BSCSCAN_API = 'https://api.bscscan.com/api';

const ETHERSCAN_API_KEY = 'NSZCD6S4TKVWRS13PMQFMVTNP6H7NAGHUY';
const SUBSCAN_API_KEY = 'f2c601793f154909b02f1ee933e1e393';
const BSCSCAN_API_KEY = '64UK9UM1AYXC7C57FQ2SXUWXRX4A9DXRQP';

interface CryptoInfo {
  symbol: string;
  name: string;
  api: string;
  coingeckoId: string;
  fetchBalance: (address: string) => Promise<string>;
}

interface WalletData {
  address: string;
  balance: string;
  usdValue: string;
}

interface HistoricalData {
  date: string;
  value: number;
}

type Timeframe = '1d' | '7d' | '30d';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
};

const CryptoWalletViewer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [cryptoList] = useState<CryptoInfo[]>([
    { 
      symbol: 'btc', 
      name: 'Bitcoin', 
      api: BLOCKCHAIN_API,
      coingeckoId: 'bitcoin',
      fetchBalance: async (address) => {
        try {
          console.log(`Fetching Bitcoin balance for address: ${address}`);
          const response = await fetch(`${BLOCKCHAIN_API}${address}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
          }
          const data = await response.json();
          if (!data.hasOwnProperty('final_balance')) {
            throw new Error('La risposta non contiene il campo final_balance');
          }
          const balance = (data.final_balance / 1e8).toFixed(8);
          console.log(`Bitcoin balance fetched: ${balance}`);
          return balance;
        } catch (error) {
          console.error('Errore nel recupero del saldo Bitcoin:', error);
          throw error;
        }
      }
    },
    { 
      symbol: 'eth', 
      name: 'Ethereum', 
      api: ETHERSCAN_API,
      coingeckoId: 'ethereum',
      fetchBalance: async (address) => {
        try {
          console.log(`Fetching Ethereum balance for address: ${address}`);
          const response = await fetch(`${ETHERSCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.status !== '1') throw new Error(data.message || 'Errore nel recupero dei dati Ethereum');
          const balance = (parseInt(data.result) / 1e18).toFixed(18);
          console.log(`Ethereum balance fetched: ${balance}`);
          return balance;
        } catch (error) {
          console.error('Errore nel recupero del saldo Ethereum:', error);
          throw error;
        }
      }
    },
    { 
      symbol: 'rndr', 
      name: 'Render Network', 
      api: ETHERSCAN_API,
      coingeckoId: 'render-token',
      fetchBalance: async (address) => {
        try {
          console.log(`Fetching Render Network balance for address: ${address}`);
          const response = await fetch(`${ETHERSCAN_API}?module=account&action=tokenbalance&contractaddress=0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.status !== '1') throw new Error(data.message || 'Errore nel recupero dei dati Render Network');
          const balance = (parseInt(data.result) / 1e18).toFixed(18);
          console.log(`Render Network balance fetched: ${balance}`);
          return balance;
        } catch (error) {
          console.error('Errore nel recupero del saldo Render Network:', error);
          throw error;
        }
      }
    },
    { 
      symbol: 'bnb', 
      name: 'Binance Coin', 
      api: BSCSCAN_API,
      coingeckoId: 'binancecoin',
      fetchBalance: async (address) => {
        try {
          console.log(`Fetching BNB balance for address: ${address}`);
          const url = `${BSCSCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${BSCSCAN_API_KEY}`;
          console.log(`Request URL: ${url}`);
          
          const response = await fetch(url);
          console.log(`Response status: ${response.status}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
          }
          
          const text = await response.text();
          console.log(`Response text: ${text}`);
          
          const data = JSON.parse(text);
          console.log(`Parsed data:`, data);
          
          if (data.status !== '1') {
            throw new Error(data.message || 'Errore nel recupero dei dati BNB');
          }
          
          const balance = (parseInt(data.result) / 1e18).toFixed(18);
          console.log(`BNB balance fetched: ${balance}`);
          return balance;
        } catch (error) {
          console.error('Errore dettagliato nel recupero del saldo BNB:', error);
          if (error instanceof Error) {
            throw new Error(`Errore nel recupero del saldo BNB: ${error.message}`);
          } else {
            throw new Error('Errore sconosciuto nel recupero del saldo BNB');
          }
        }
      }
    },
  ]);

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [worker, setWorker] = useState<Worker | null>(null);
  
  const [assetDistribution, setAssetDistribution] = useState<{ name: string; value: number }[]>([]);
  const [performanceData, setPerformanceData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    const newWorker = new Worker();
    
    newWorker.onmessage = (event) => {
      if (event.data.error) {
        console.error('Error from worker:', event.data.error);
        setError(`Errore nell'elaborazione dei dati storici: ${event.data.error}`);
      } else {
        console.log('Received data from worker:', event.data.length);
        setHistoricalData(event.data);
      }
    };

    newWorker.onerror = (error) => {
      console.error('Error in worker:', error);
      setError(`Errore nell'elaborazione dei dati storici: ${error.message}`);
    };

    setWorker(newWorker);

    return () => {
      newWorker.terminate();
    };
  }, []);

  useEffect(() => {
    if (walletData && selectedCrypto && historicalData.length > 0) {
      // Calcola la distribuzione degli asset
      const distribution = [{
        name: selectedCrypto.name,
        value: parseFloat(walletData.usdValue)
      }];
      setAssetDistribution(distribution);

      // Calcola i dati di performance
      const performance = historicalData.map(data => ({
        date: data.date,
        value: data.value
      })).filter(item => item.date && typeof item.value === 'number');
      setPerformanceData(performance);
    }
  }, [walletData, historicalData, selectedCrypto]);

  const filteredCryptoList = useMemo(() => {
    return cryptoList.filter(crypto =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cryptoList, searchTerm]);

  const fetchHistoricalData = async (coingeckoId: string, balance: number, timeframe: Timeframe) => {
    const cacheKey = `${coingeckoId}-${timeframe}`;
    const cachedData = cacheService.get<HistoricalData[]>(cacheKey);

    if (cachedData) {
      console.log('Using cached historical data');
      setHistoricalData(cachedData);
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '1d': startDate.setDate(startDate.getDate() - 1); break;
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
    }

    try {
      console.log(`Fetching historical data for ${coingeckoId} from ${startDate} to ${endDate}`);
      const response = await fetch(
        `${COINGECKO_API}/coins/${coingeckoId}/market_chart/range?vs_currency=usd&from=${startDate.getTime() / 1000}&to=${endDate.getTime() / 1000}`
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      const data = await response.json();

      console.log('Fetched historical data:', { pricesLength: data.prices.length });

      if (!Array.isArray(data.prices) || data.prices.length === 0) {
        throw new Error('Invalid or empty price data received');
      }

      if (worker) {
        console.log('Sending data to worker:', { pricesLength: data.prices.length, balance });
        worker.postMessage({ prices: data.prices, balance });
      } else {
        console.warn('Worker not available, processing data in main thread');
        const historicalPrices = data.prices.map(([timestamp, price]: [number, number]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          value: parseFloat((price * balance).toFixed(2)),
        }));
        setHistoricalData(historicalPrices);
        cacheService.set(cacheKey, historicalPrices);
        console.log(`Historical data processed: ${historicalPrices.length} data points`);
      }
    } catch (err) {
      console.error('Errore dettagliato durante il recupero dei dati storici:', err);
      setError(`Errore nel recupero dei dati storici: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`);
    }
  };

  const fetchWalletData = async () => {
    setError('');
    setWalletData(null);
    setHistoricalData([]);
    setLoading(true);

    try {
      if (!selectedCrypto) throw new Error('Seleziona una criptovaluta');
      if (!address) throw new Error('Inserisci un indirizzo');

      const cacheKey = `wallet-${selectedCrypto.coingeckoId}-${address}`;
      const cachedWalletData = cacheService.get<WalletData>(cacheKey);

      if (cachedWalletData) {
        console.log('Using cached wallet data');
        setWalletData(cachedWalletData);
        await fetchHistoricalData(selectedCrypto.coingeckoId, parseFloat(cachedWalletData.balance), timeframe);
      } else {
        console.log(`Fetching balance for ${selectedCrypto.name} address: ${address}`);
        const balance = await selectedCrypto.fetchBalance(address);
        console.log(`Balance fetched: ${balance}`);
        
        console.log(`Fetching USD price for ${selectedCrypto.coingeckoId}`);
        const priceResponse = await fetch(`${COINGECKO_API}/simple/price?ids=${selectedCrypto.coingeckoId}&vs_currencies=usd`);
        if (!priceResponse.ok) {
          throw new Error(`Errore nel recupero del prezzo USD: ${priceResponse.status} ${priceResponse.statusText}`);
        }
        const priceData = await priceResponse.json();
        const usdPrice = priceData[selectedCrypto.coingeckoId].usd;
        console.log(`USD price fetched: ${usdPrice}`);

        const usdValue = (parseFloat(balance) * usdPrice).toFixed(2);
        
        const newWalletData = {
          address: address,
          balance: balance,
          usdValue: usdValue,
        };
        
        setWalletData(newWalletData);
        cacheService.set(cacheKey, newWalletData, 30 * 60 * 1000); // Cache for 30 minutes

        await fetchHistoricalData(selectedCrypto.coingeckoId, parseFloat(balance), timeframe);
      }
    } catch (err) {
      console.error('Errore dettagliato durante il recupero dei dati:', err);
      if (err instanceof Error) {
        setError(`Errore: ${err.message}`);
      } else {
        setError('Si è verificato un errore sconosciuto durante il recupero dei dati del wallet.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calcola le metriche del portafoglio
  const totalValue = assetDistribution.reduce((sum, asset) => sum + asset.value, 0);
  const dailyChange = performanceData.length > 1 
    ? ((performanceData[performanceData.length - 1].value - performanceData[performanceData.length - 2].value) / performanceData[performanceData.length - 2].value) * 100 
    : 0;
  const weeklyChange = performanceData.length > 7 
    ? ((performanceData[performanceData.length - 1].value - performanceData[performanceData.length - 8].value) / performanceData[performanceData.length - 8].value) * 100 
    : 0;
  const monthlyChange = performanceData.length > 30 
    ? ((performanceData[performanceData.length - 1].value - performanceData[0].value) / performanceData[0].value) * 100 
    : 0;

  return (
    <AnimatedDiv
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-500'} p-4 sm:p-8`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sm:max-w-2xl">
        <div className="p-4 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 dark:text-blue-300">
              Multi-Blockchain Wallet Viewer
            </h1>
            <AnimatedButton
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon /> : <Sun />}
            </AnimatedButton>
          </div>
          
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca una criptovaluta..."
              className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {searchTerm && filteredCryptoList.length > 0 && (
            <ul className="mb-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
              {filteredCryptoList.map((crypto) => (
                <li 
                  key={crypto.symbol} 
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => {
                    setSelectedCrypto(crypto);
                    setSearchTerm(crypto.name);
                  }}
                >
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </li>
              ))}
            </ul>
          )}

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={`Inserisci l'indirizzo del wallet ${selectedCrypto ? selectedCrypto.name : ''}`}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
          />
          
          <AnimatedButton
            onClick={fetchWalletData}
            disabled={loading || !selectedCrypto}
            className={`w-full bg-blue-500 text-white px-4 py-2 rounded-md text-sm sm:text-base hover:bg-blue-600 transition duration-300 ${(loading || !selectedCrypto) ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Caricamento...' : 'Visualizza Wallet'}
          </AnimatedButton>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {walletData && (
            <AnimatedDiv variants={slideIn} className="mt-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white">Dettagli del Wallet:</h2>
              <ul className="space-y-2 text-sm sm:text-base">
                <li className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <span className="font-semibold">Indirizzo:</span> 
                  <span className="break-all">{walletData.address}</span>
                </li>
                <li className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <span className="font-semibold">Saldo:</span> {walletData.balance} {selectedCrypto?.symbol.toUpperCase()}
                </li>
                <li className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <span className="font-semibold">Valore USD:</span> ${walletData.usdValue}
                </li>
              </ul>

              <PortfolioMetrics
                totalValue={totalValue}
                dailyChange={dailyChange}
                weeklyChange={weeklyChange}
                monthlyChange={monthlyChange}
              />

              <AssetDistribution assets={assetDistribution} />

              <PerformanceOverTime data={performanceData} />

              {historicalData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Valore Storico del Portafoglio</h3>
                  <div className="flex space-x-2 mb-4">
                    {(['1d', '7d', '30d'] as Timeframe[]).map((tf) => (
                      <AnimatedButton
                        key={tf}
                        onClick={() => {
                          setTimeframe(tf);
                          fetchHistoricalData(selectedCrypto!.coingeckoId, parseFloat(walletData.balance), tf);
                        }}
                        className={`px-3 py-1 rounded ${timeframe === tf ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tf === '1d' ? '1 Giorno' : tf === '7d' ? '7 Giorni' : '30 Giorni'}
                      </AnimatedButton>
                    ))}
                  </div>
                  <div className="mb-4 dark:text-white">
                    <p>Numero di punti dati: {historicalData.length}</p>
                    <p>Primo punto: {formatDate(historicalData[0].date)} - Valore: ${historicalData[0].value.toFixed(2)}</p>
                    <p>Ultimo punto: {formatDate(historicalData[historicalData.length - 1].date)} - Valore: ${historicalData[historicalData.length - 1].value.toFixed(2)}</p>
                  </div>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return timeframe === '1d' ? date.toLocaleTimeString() : date.toLocaleDateString();
                          }}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Valore']}
                          labelFormatter={(label) => `Data: ${formatDate(label)}`}
                        />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </AnimatedDiv>
          )}
        </div>
      </div>
    </AnimatedDiv>
  );
};

export default CryptoWalletViewer;