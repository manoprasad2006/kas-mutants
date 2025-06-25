import axios from 'axios';

async function getNftRank(ticker, tokenId) {
  const apiUrl = 'https://api.kaspa.com/api/krc721/tokens';

  try {
    const response = await axios.post(
      apiUrl,
      {
        ticker: ticker,
        sortField: 'rarityRank',  // Sorting by rarityRank (rank)
        sortDirection: 'asc',     // Ascending order for rank (lower rarityRank means higher rank)
        limit: 10000,             // High limit to ensure we get all tokens
        offset: 0                 // Starting from the first token
      },
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const items = response.data.items;  // List of tokens in the collection

    // Finding the index of the tokenId in the list of items
    const index = items.findIndex(item => String(item.tokenId) === String(tokenId));

    if (index === -1) {
      console.log(`❌ Token ID ${tokenId} not found in the ${ticker} collection.`);
    } else {
      // Rank is 1-based, so add 1 to the index
      const rank = index + 1;
      console.log(`✅ ${ticker} #${tokenId} has rank: #${rank}`);
    }

  } catch (error) {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} ${error.response.statusText}`);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Example usage
getNftRank('MUTANT', 19);  // Replace with your desired ticker and tokenId
