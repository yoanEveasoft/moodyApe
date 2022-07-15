import { FunctionComponent, useEffect, useState } from 'react';
import { Button, Col, Spinner } from 'react-bootstrap';
import styles from './BabyMinter.module.scss';
import { useWeb3React } from '@web3-react/core';
import contractABI from "../../WalletHelpers/babyContractABI.json";

interface Props {
  nftQuantity: number;
}

const BabyMinter: FunctionComponent<Props> = ({ nftQuantity }): JSX.Element => {
  const { account, library } = useWeb3React();
  const [hash, setHash] = useState<string>('');
  const [transactionReceipt, setTransactionReceipt] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPublicSaleActive, setIsPublicSaleActive] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(0.002);
  const [number, setNumber] = useState<number>(1);
  const [isSoldOut, setIsSoldOut] = useState<boolean>(false);
  // Change to contract address on mainnet
  const contractAddress = "0xB3Cc0Fc65c087a9e755428fe9Bf5A4fBeFcD83b5";
  /* const transactionLink = `https://etherscan.io/tx/${hash}`;
  const openSeaLink = `https://opensea.io/assets/${contractAddress}/`; */
  const contract = new library.eth.Contract(contractABI as any, contractAddress);

  useEffect(() => {
    (async () => {
      if (!!account && !!library) {
        setIsPublicSaleActive(await contract.methods.isPublicSaleActive().call());
        setPrice((await contract.methods.NFTPrice().call()) / 1000000000000000000);
      }
    })()
  }, [account, library])

  const decrementNumber = () => {
    if (number < 2) return;
    setNumber((number) => number - 1);
  }

  const incrementNumber = () => {
    setNumber((number) => number + 1);
  }

  const MintOptions = () => {
    return (
      <Col className={styles.publicSaleText}>
        <h1>Public Sale</h1>
        <div className={styles.item}>
          <div>
            Quantity
          </div>
          <div className="d-flex flex-space-between">
            <div onClick={() => decrementNumber()} className={styles.btn}>-</div>
            <div className={styles.number}>{number}</div>
            <div onClick={() => incrementNumber()} className={styles.btn}>+</div>
          </div>
        </div>

        <div className={styles.item}>
          <div>
            Unit price
          </div>
          <div className="d-flex">
            <div>
              <img className={styles.ether_logo} src='/ether.png' />
            </div>
            <div>{price} ETH</div>
          </div>
        </div>

        <div className={styles.item}>
          <div>
            Total price
          </div>
          <div className="d-flex">
            <div>
              <img className={styles.ether_logo} src='/ether.png' />
            </div>
            <div>{price * number} ETH</div>
          </div>
        </div>
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
          /*  nftLinks.push(openSeaLink + nftId); */
        });
      } else {
        const nftId = transactionReceipt?.events?.TransferSingle?.returnValues?.id;
        /* nftLinks = [openSeaLink + nftId]; */
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

      if (!(await contract.methods.isActive().call())) {
        alert('Public sale has not started')
        setLoading(false)
        return
      }

      if (!isPublicSaleActive) {
        alert('Public sale has not started')
        setLoading(false)
        return
      }


      const nftsValue = number * await contract.methods.NFTPrice().call();

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
        .mintPublicSale(number)
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
  };

  return (
    <Col className={styles.minterContainer}>
      {account && !transactionReceipt && !isSoldOut && <MintOptions />}

      {isSoldOut && <h1>SOLD OUT!</h1>}

      <Col className='text-center'>
        {hash && (
          <p>
            ✅ Check out your transaction on Etherscan{' '}
            {/* <a href={transactionLink} target='_blank' rel='noreferrer'>
              here
            </a> */}
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

export default BabyMinter;
