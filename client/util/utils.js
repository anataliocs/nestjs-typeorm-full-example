export function createLinkSol(json) {
  const link = document.createElement('a');
  link.href = `https://solscan.io/block/${json.blockNumber}`;
  link.text = json.blockNumber;
  link.target = '_blank';
  link.title = 'Open Block in Solscan.io';
  return link;
}

export function createLinkEth(block) {
  const link = document.createElement('a');
  link.href = `https://etherscan.io/block/${block.blockNumber}`;
  link.text = `View Block ${block.blockNumber} on Etherscan`;
  link.target = '_blank';
  link.title = 'Open Block in Etherscan';
  return link;
}
