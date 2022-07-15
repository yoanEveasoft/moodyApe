import type { NextPage } from "next";
import styles from "./freeMint.module.scss";
import SplitConnectWallet from "../../components/SplitConnectWallet/SplitConnectWallet";
import { useWeb3React } from "@web3-react/core";
import { Col, Row, Container } from "react-bootstrap";
import Claimer from '../../components/Claimer/Claimer';
import { MoralisProvider } from "react-moralis";

const BabyApe: NextPage = () => {
  const { account, library } = useWeb3React();

  return (
    <MoralisProvider
      appId="eSsVj5bzePpT0Fu0AV5ZzAOK0YebNRdYJhZQNekT"
      serverUrl="https://jhfzppq6ecem.usemoralis.com:2053/server"
    >
      <div className={styles.container}>
        <img
          className={styles.background}
          src="/bo_background.png"
          alt="background"
        />

        <div className={styles.mintWrapper}>
          <Container fluid>
            <Row className={styles.header}>
              <Col className="d-flex justify-content-center align-items-center">
                <div className={styles.golden_ticket_title}>Moody Ape Club</div>
              </Col>
              <Col className="d-flex justify-content-center">
                <img className={styles.nft_tete_singe} src="/logo-singe.png" />
              </Col>
              <Col className="d-flex flex-direction-row justify-content-center align-items-center">
                <a href="https://twitter.com/MoodyApeClub">
                  <img className={styles.emojis} src="/2.png" />
                </a>
                <a href="https://discord.com/invite/EDATJr4uzW">
                  <img className={styles.emojis} src="/3.png" />
                </a>
                <a href="https://www.instagram.com/moodyapeclub/">
                  <img className={styles.emojis} src="/4.png" />
                </a>
              </Col>
            </Row>
          </Container>
          {!!account && !!library ? (
            <Claimer />
          ) : (
            <>
              <div className={styles.golden_ticket_title}>BABY APE </div>
              <div className={styles.private_sale_title}>
                CLAIM YOUR BABY APE
              </div>
              <div>
                <img className={styles.nft_logo} src="/Baby_GIF.gif" />
              </div>

              <Col className={styles.mintWrapper}>
                <div className={styles.private_sale_title}>
                  Connect your wallet if you want to claim your NFT
                </div>
                <SplitConnectWallet />
              </Col>
            </>
          )}
        </div>
      </div>
    </MoralisProvider>
  );
};

export default BabyApe;
