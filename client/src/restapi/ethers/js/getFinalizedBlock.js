import { createLinkEth } from '../../../../util/utils.js';
import { displayResults, fetchResponse } from '../../common/fetchClient.js';

export async function getFinalizedBlock() {
  const response = await fetchResponse(
    'http://127.0.0.1:3000/v1/ethers/finalized-block',
  );

  displayResults(response, createLinkEth(response));
}

document
  .querySelector('#get-finalized-block-button')
  .addEventListener('click', async () => {
    console.log('Getting latest finalized block...');
    await getFinalizedBlock();
  });
