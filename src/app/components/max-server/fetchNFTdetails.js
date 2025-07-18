import { connection } from './web3Provider';

export const fetchNFTDetails = async (nftPublicKey) => {
  try {
    const nftAccountInfo = await connection.getParsedAccountInfo(new PublicKey(nftPublicKey));
    if (nftAccountInfo.value) {
      return nftAccountInfo.value.data; // Assuming the structure contains the necessary details
    } else {
      console.log('NFT details not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    return null;
  }
};
