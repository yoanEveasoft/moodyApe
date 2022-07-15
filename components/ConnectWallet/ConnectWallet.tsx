import { useState, useEffect } from 'react';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector';
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from '@web3-react/frame-connector';
import Web3 from 'web3';

import { useEagerConnect, useInactiveListener } from '../../WalletHelpers/hooks';
import { injected, walletconnect, walletlink } from '../../WalletHelpers/connectors';
import { Col, Button, Dropdown, Spinner, Modal } from 'react-bootstrap';
import styles from './ConnectWallet.module.scss';
import Image from 'next/image';

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'Install MetaMask on desktop or visit from Metamask app browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. Connect to Rinkeby TestNet";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect ||
    error instanceof UserRejectedRequestErrorFrame
  ) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
}

const ConnectWallet = () => {
  const context = useWeb3React<Web3>();
  const { connector, account, activate, deactivate, error } = context;
  const [activatingConnector, setActivatingConnector] = useState<any>();
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
      if (!error) setShowModal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatingConnector, connector]);

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);

  const toggle = () => setShowModal(!showModal);

  const modalErrorContent = (error: Error) => {
    return (
      <Col className={styles.modalContent}>
        <p>{getErrorMessage(error)}</p>
        <Button
          className='rounded-pill px-5 my-2'
          onClick={() => {
            deactivate();
          }}>
          Go back
        </Button>
      </Col>
    );
  };

  const modalContent = () => {
    return (
      <Col className={styles.modalContent}>
        <h2>Connect your wallet.</h2>
        {/* <p>
          By connecting your wallet, you agree to our <br /> Terms of Service and our Privacy
          Policy.
        </p> */}

        {/* Metamask */}
        <Button
          className={styles.metamask}
          onClick={() => {
            setActivatingConnector(injected);
            activate(injected);
          }}>
          <div className={styles.buttonContent}>
            {activatingConnector === injected ? (
              <>
                Connecting...
                <Spinner size='sm' animation='border' />
              </>
            ) : (
              <>
                Metamask
                <Image src='/metamask.svg' width={30} height={30} alt='logo metamask' />
              </>
            )}
          </div>
        </Button>

        {/* WalletConnect */}
        <Button
          className={styles.walletConnect}
          onClick={() => {
            setActivatingConnector(walletconnect);
            activate(walletconnect);
          }}>
          <div className={styles.buttonContent}>
            {activatingConnector === walletconnect ? (
              <>
                Connecting...
                <Spinner size='sm' animation='border' />
              </>
            ) : (
              <>
                WalletConnect
                <Image src='/walletConnect.svg' width={30} height={30} alt='logo metamask' />
              </>
            )}
          </div>
        </Button>

        {/* WalletLink */}
        <Button
          className={styles.walletLink}
          onClick={() => {
            setActivatingConnector(walletlink);
            activate(walletlink);
          }}>
          <div className={styles.buttonContent}>
            {activatingConnector === walletlink ? (
              <>
                Connecting...
                <Spinner size='sm' animation='border' />
              </>
            ) : (
              <>
                WalletLink
                <Image src='/walletlink.png' width={30} height={30} alt='logo metamask' />
              </>
            )}
          </div>
        </Button>

        {/* <p>
          New to Ethereum? <br />
          <a href='https://metamask.io/index.html' target='_blank' rel="noreferrer">Learn more about wallets</a>
        </p> */}
      </Col>
    );
  };

  return (
    <>
      <Col>
        {account ? (
          <Dropdown>
            <Dropdown.Toggle variant='dark' className='rounded-pill px-5 my-2'>
              {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => deactivate()}>Disconnect</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Button
            variant='dark'
            className='rounded-pill px-5 my-2'
            onClick={() => setShowModal(true)}
          >
            Connect Wallet
          </Button>
        )}
      </Col>

      <Modal
        show={showModal}
        onHide={toggle}
        centered
        aria-labelledby='Wallet connection'
        animation={false}>
        <Modal.Body style={{ color: 'black' }}>
          {!!error ? modalErrorContent(error) : modalContent()}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ConnectWallet;
