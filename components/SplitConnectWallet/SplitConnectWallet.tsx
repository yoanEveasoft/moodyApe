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
import { Col, Button, Dropdown, Spinner } from 'react-bootstrap';
import styles from './SplitConnectWallet.module.scss';

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'Install MetaMask on desktop or visit from Metamask app browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. Connect to Ethereum Mainnet";
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

const SplitConnectWallet = () => {
  const context = useWeb3React<Web3>();
  const { connector, account, activate, deactivate, error } = context;
  const [activatingConnector, setActivatingConnector] = useState<any>();

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatingConnector, connector]);

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);

  const killSession = () => {
    if (connector === injected) {
      deactivate();
    } else {
      (connector as any).close();
    }
  }

  const ErrorContent = (error: Error) => {
    return (
      <Col className={styles.connectContent}>
        <p>{getErrorMessage(error)}</p>
        <Button
          className='rounded-pill px-5 my-2'
          onClick={() => killSession()}
        >
          Go back
        </Button>
      </Col>
    );
  };

  const connectContent = () => {
    return (
      <div className={styles.button_container}>
        {/* WalletConnect */}
        <div
          className={styles.button}
          onClick={() => {
            setActivatingConnector(walletconnect);
            activate(walletconnect);
          }}
        >
          {activatingConnector === walletconnect ? (
            <>
              Connecting...
              <Spinner size='sm' animation='border' />
            </>
          ) : (
            <>
              <div>
                <img className={styles.logo} src='/wallet_connect.png' />
              </div>
              <div>
                Wallet<br></br>connect
              </div>
            </>
          )}
        </div>

        {/* Metamask */}
        <div
          className={styles.button}
          onClick={() => {
            setActivatingConnector(injected);
            activate(injected);
          }}
        >
          {activatingConnector === injected ? (
            <>
              Connecting...
              <Spinner size='sm' animation='border' />
            </>
          ) : (
            <>
              <div>
                <img className={styles.logo} src='/metamask.svg' />
              </div>
              <div>
                Connect<br></br>metamask
              </div>
            </>
          )}
        </div>

        {/* WalletLink */}
        <div
          className={styles.button}
          onClick={() => {
            setActivatingConnector(walletlink);
            activate(walletlink);
          }}
        >
          {activatingConnector === walletlink ? (
            <>
              Connecting...
              <Spinner size='sm' animation='border' />
            </>
          ) : (
            <>
              <div>
                <img className={styles.logo} src='/coinBase.png' />
              </div>
              <div>
                Connect<br></br>CoinBase
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {account ? (
        <Dropdown>
          <Dropdown.Toggle className={styles.collect_wallet}>
            {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => killSession()}>Disconnect</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        !!error ? ErrorContent(error) : connectContent()
      )}
    </div>
  );
};

export default SplitConnectWallet;
