const getTopHeadlines = async (q, newsapi) => {
  try {
const results = await newsapi.v2.topHeadlines({
  q,
  language: 'en',
  country: "us",
}) 
  return results;
} catch(err) { console.log(err)};

// results =  {
//     source: [Object],
//     author: 'Khyathi Dalal',
//     title: "Why Bitcoin's Rally Is Stalling Below $100,000 - Benzinga",
//     description: 'Top cryptocurrencies like Bitcoin (CRYPTO: BTC), Ethereum (CRYPTO: ETH), Solana (CRYPTO: SOL), and XRP (CRYPTO:',
//     url: 'https://www.benzinga.com/markets/cryptocurrency/24/11/42163156/why-bitcoins-rally-is-stalling-below-100000',
//     urlToImage: 'https://cdn.benzinga.com/files/images/story/2024/11/25/Kamala-Harris-Focus-on-Cryptocurrency-an.jpeg?width=1200&height=800&fit=crop',
//     publishedAt: '2024-11-25T13:46:02Z',
//     content: 'Top cryptocurrencies like BitcoinBTC/USD, EthereumETH/USD, Solana SOL/USD, and XRPXRP/USD are seeing declining bullish sentiment despite rising cost bases for holders.\r\n' +
//       'What Happened: Santiment data … [+1869 chars]'
// }
}

module.exports = {
getTopHeadlines
}