import { FunctionComponent, useEffect, useState } from 'react';
import { Button, Col, Spinner } from 'react-bootstrap';
import styles from './Minter.module.scss';
import { useWeb3React } from '@web3-react/core';
import contractABI from '../../WalletHelpers/contractAbi.json';
import { GetMerkleProof } from '../merkle';

interface Props {
  nftQuantity: number;
}

const Minter: FunctionComponent<Props> = ({ nftQuantity }): JSX.Element => {
  const { account, library } = useWeb3React();
  const [hash, setHash] = useState<string>('');
  const [transactionReceipt, setTransactionReceipt] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPresale, setIsPresale] = useState<boolean>(false);
  const [isPrivateSale, setIsPrivateSale] = useState<boolean>(false);
  const [isSoldOut, setIsSoldOut] = useState<boolean>(false);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const transactionLink = `https://etherscan.io/tx/${hash}`;
  const openSeaLink = `https://opensea.io/assets/${contractAddress}/`;
  const contract = new library.eth.Contract(contractABI as any, contractAddress);

  useEffect(() => {
    (async () => {
      if (!!account && !!library) {
        setIsPrivateSale(await contract.methods.isPrivateSaleActive().call());
        setIsPresale(await contract.methods.isPresaleActive().call());
      }
    })()
  }, [account, library])

  const MintOptions = () => {
    return (
      <Col className='text-center'>
        <div className={styles.mintButton} onClick={() => mintNFT()}>MINT</div>
      </Col>
    );
  };

  const confirmationMessage = () => {
    let nftLinks: string[] = [];

    if (transactionReceipt) {
      if (transactionReceipt?.events?.TransferBatch) {
        transactionReceipt?.events?.TransferBatch?.returnValues?.ids.map((values: string) => {
          const nftId = values;
          nftLinks.push(openSeaLink + nftId);
        });
      } else {
        const nftId = transactionReceipt?.events?.TransferSingle?.returnValues?.id;
        nftLinks = [openSeaLink + nftId];
      }
    }

    return (
      <>
        <h3>congratulations!</h3>
        <h4>
          see on opensea here:{'  '}
          {nftLinks.map((link, i) => {
            return (
              <div key={link}>
                <a target='_blank' href={link} rel='noreferrer'>
                  Moody Ape Club {i + 1}
                </a>
              </div>
            );
          })}
        </h4>
      </>
    );
  };

  const hasFunds = async (nftsPrice: number) => {
    return nftsPrice <= (await library.eth.getBalance(account));
  }

  const mintNFT = async (): Promise<void> => {
    if (!!account && !!library) {
      setError('');
      setLoading(true);
      const proof = GetMerkleProof(account);

      if (!(await contract.methods.isActive().call())) {
        alert('Second sale has not started')
        setLoading(false)
        return
      }

      // private sale & presale
      if (isPrivateSale || isPresale) {
        if (!proof.length) {
          alert('Your are not in Pre-Sale list')
          setLoading(false);
          return;
        }

        const maxPresale = await contract.methods.maxPerWalletPresale().call();

        if (nftQuantity > maxPresale) {
          alert('Max 3 NFT for Private sale & Presale')
          setLoading(false)
          return
        }

        const nftsValue = !isPresale
          ? nftQuantity * await contract.methods.privateSalePrice().call()
          : nftQuantity * await contract.methods.presalePrice().call();

        if (!(await hasFunds(nftsValue))) {
          alert('Insufficient funds');
          setLoading(false);
          return;
        }

        const transactionParameters = {
          from: account,
          value: await nftsValue.toString(),
        };

        contract.methods
          .mintNFTDuringPresale(nftQuantity, proof)
          .send(transactionParameters)
          .on('transactionHash', function (hash: any) {
            setHash(hash);
          })
          .on('receipt', function (receipt: any) {
            setTransactionReceipt(receipt);
            setLoading(false);
          })
          .on('error', function (error: any, receipt: any) {
            setError(error.message);
            console.log('this is the error:', error.message);
            setLoading(false);
          });
      } else {
        const nftsValue = nftQuantity * await contract.methods.NFTPrice().call();

        if (!(await hasFunds(nftsValue))) {
          alert('Insufficient funds');
          setLoading(false);
          return;
        }

        const transactionParameters = {
          from: account,
          value: nftsValue,
        };

        contract.methods
          .mintNFT(nftQuantity)
          .send(transactionParameters)
          .on('transactionHash', function (hash: any) {
            setHash(hash);
          })
          .on('receipt', function (receipt: any) {
            setTransactionReceipt(receipt);
            setLoading(false);
          })
          .on('error', function (error: any, receipt: any) {
            setError(error.message);
            console.log('this is the error:', error.message);
            setLoading(false);
          });
      }
    }
  };

  return (
    <Col className={styles.minterContainer}>
      {account && !transactionReceipt && !isSoldOut && <MintOptions />}

      {isSoldOut && <h1>SOLD OUT!</h1>}

      <Col className='text-center'>
        {hash && (
          <p>
            ✅ Check out your transaction on Etherscan{' '}
            <a href={transactionLink} target='_blank' rel='noreferrer'>
              here
            </a>
          </p>
        )}

        {error && (
          <h3>
            😥 Something went wrong:
            <br />
            {error}
          </h3>
        )}

        {loading && (
          <h3>
            Waiting for transaction <Spinner animation='border' size='sm' />
          </h3>
        )}

        {transactionReceipt && confirmationMessage()}
      </Col>
    </Col>
  );
};

export default Minter;
