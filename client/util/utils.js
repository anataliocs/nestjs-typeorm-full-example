export function createLinkSol(block) {
  const link = document.createElement('a');
  link.href = `https://solscan.io/block/${block.blockNumber}`;
  link.text = `View Block ${block.blockNumber} on Solscan.io`;
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
