import { createLinkSol } from '../../../../util/utils.js';
import { displayResults, fetchResponse } from '../../common/fetchClient.js';

export async function getLatestBlockNumber() {
  const response = await fetchResponse(
    'http://127.0.0.1:3000/v1/solkit/block-number',
  );

  displayResults(response, createLinkSol(response));
}

document
  .querySelector('#get-block-number-button')
  .addEventListener('click', async () => {
    console.log('Getting latest block number...');
    await getLatestBlockNumber();
  });
