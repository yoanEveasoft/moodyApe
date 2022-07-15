import type { NextPage } from 'next';
import styles from '../styles/Mint.module.scss';
import SplitConnectWallet from '../components/SplitConnectWallet/SplitConnectWallet';
import { useWeb3React } from '@web3-react/core';
import Minter from '../components/Minter/Minter';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import contractABI from '../WalletHelpers/contractAbi.json';

const Mint: NextPage = () => {
  const provider = 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213';
  const { account, library } = useWeb3React();
  const [number, setNumber] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0.18);
  const [totalPrice, setTotalPrice] = useState<number>(unitPrice);
  const [mainTitle, setMainTitle] = useState<string>('');
  const [isOpenSale, setIsOpenSale] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(contractABI as any, contractAddress);

  useEffect(() => {
    (async () => {
      const isPrivateSaleActive = await contract.methods.isPrivateSaleActive().call();
      const isPresaleActive = await contract.methods.isPresaleActive().call();
      const isContractActive = await contract.methods.isActive().call();

      if (isPrivateSaleActive && !isPresaleActive) {
        setUnitPrice((await contract.methods.privateSalePrice().call()) / 1000000000000000000);
        setMainTitle('Private-Sale');
      }

      if (isPresaleActive) {
        setUnitPrice((await contract.methods.presalePrice().call()) / 1000000000000000000);
        setMainTitle('Pre-Sale');
      }

      if (!isPrivateSaleActive && !isPresaleActive) {
        setIsOpenSale(true)
        setUnitPrice((await contract.methods.NFTPrice().call()) / 1000000000000000000);
        setMainTitle('Open-Sale');
      }
    })()
  }, []
  )
  useEffect(() => {
    setTotalPrice(unitPrice * number);
    setTotalPrice(Math.round(unitPrice * number * 100) / 100);
  }, [number, unitPrice])

  const decrementNumber = () => {
    if (number < 2) return;
    setNumber((number) => number - 1);
  }

  const incrementNumber = () => {
    // if (!isOpenSale && number === 3) return
    setNumber((number) => number + 1);
  }


  return (
    <div className={styles.container}>
      <video
        playsInline
        preload='metadata'
        loop
        autoPlay
        muted
        controls
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, height: '120%' }}
      >
        <source src='/background.mp4' type='video/mp4' />
        Your browser does not support the video tag.
      </video>

      <div className={styles.mintWrapper}>
        <div>
          <img className={styles.nft_tete_singe} src='/logo-singe.png' />
        </div>

        {/* <div className={styles.private_sale_title}>{mainTitle} is now live !</div>  */}
        <div className={styles.private_sale_title}>Second sale closed</div>

        <div className={styles.mint_card}>
          <div>
            <img className={styles.nft_logo} src='/singe.gif' />
          </div>

          {/* {!isOpenSale &&
            <div className={styles.warning_blue_message}>
              3 MAX PER WALLET
            </div>
          } */}

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
              <div>{unitPrice} ETH</div>
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
              <div>{totalPrice} ETH</div>
            </div>
          </div>

          {/* <div className={styles.remaining}>
            Remaining : {remaining}/{totalNFT}
          </div> */}
        </div>

        <div className={styles.mintWrapper}>
          {/* <div className={styles.private_sale_title}>First Phase of the Sale Completed</div> */}

          {/* <div className={styles.rigth}>
            {!(!!account && !!library) && (
              <div className={styles.collect_wallet}>
                Connect your wallet to mint:
              </div>
            )}
            <SplitConnectWallet />

            {(!!account && !!library) && (
              <Minter nftQuantity={number} />
            )}
          </div> */}
        </div>
      </div>
    </div >
  )
}

export default Mint;
