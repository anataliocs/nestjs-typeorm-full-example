import { createLinkSol } from '../../../../util/utils.js';
import {
  displayGraphQLErrors,
  displayResults,
  graphQLRequest,
} from '../../common/graphqlClient.js';

export async function getSolBlockByNumber() {
  const blockNumber = document.getElementById('blockNumber').value.toString();
  if (!blockNumber) {
    alert('Please enter a valid block number');
    return;
  }

  const query = `
        query GetSolanaBlockByNumber($blockNumber: String!) {
          getSolanaBlockByNumber(blockNumber: $blockNumber) {
            blockNumber
            creationDate
            hash
            transactionCount
          }
        }
      `;

  try {
    const response = await graphQLRequest(query, blockNumber);

    if (response.errors) {
      displayGraphQLErrors(response.errors);
      return;
    }

    const block = response.data.getSolanaBlockByNumber;
    displayResults(block, createLinkSol(block));
  } catch (error) {
    displayGraphQLErrors(error.message);
    console.log(error);
  }
}

document
  .querySelector('#get-block-by-number-button')
  .addEventListener('click', async () => {
    console.log('Getting block by number...');
    await getSolBlockByNumber();
  });
