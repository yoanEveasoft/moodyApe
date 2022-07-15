import type { NextPage } from 'next';
import { useState } from 'react';
import styles from './Root.module.scss';
import { GetRoot } from '../../components/merkle';
import { useWeb3React } from '@web3-react/core';
import ConnectWallet from '../../components/ConnectWallet/ConnectWallet';
import { Button, Col, Container } from 'react-bootstrap';

const Root: NextPage = () => {
  const { account, library } = useWeb3React();
  const [root, setRoot] = useState('');
  const dev = '0x82048089C65773c99f54972DEb945ead545d1C6b';

  const getRoot = () => {
    setRoot(GetRoot());
  }

  return (
    <div className={styles.container}>
      <Col className={styles.header}>
        <Container className={styles.headerWrapper}>
          <Col md={2}>
            <ConnectWallet />
          </Col>
        </Container>
      </Col>

      <Col className={styles.rootWrapper}>
        {!account && (
          <Col>
            <h1>Connect your wallet to starte</h1>
          </Col>
        )}

        {(account === dev) && (
          <Col >
            <Button onClick={() => getRoot()}>GET ROOT</Button>
            <h4>{root}</h4>
          </Col>
        )}

      </Col>
    </div>
  )
}

export default Root;
