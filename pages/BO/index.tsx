import type { NextPage } from "next";
import styles from "./BO.module.scss";
import SplitConnectWallet from "../../components/SplitConnectWallet/SplitConnectWallet";
import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import { Col, Row, Container } from "react-bootstrap";
import NFTAdmin from "../../components/NFTAdmin/NFTAdmin";
import { MoralisProvider } from "react-moralis";

const BackOffice: NextPage = () => {
    const { account, library } = useWeb3React();
    const [connect, setConnect] = useState<boolean>(false);

    return (
        <MoralisProvider
            appId="cC0DemZRZtL72uWiDivklNj6UyvwX84WnvYQQoST"
            serverUrl="https://0slpllmj1j0z.usemoralis.com:2053/server"
        >
            <div className={styles.container}>
                <img
                    className={styles.background}
                    src="/bo_background.png"
                    alt="background"
                />
                {/* <video
                    playsInline
                    preload="metadata"
                    loop
                    autoPlay
                    muted
                    controls
                    style={{
                        position: "fixed",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: "120%",
                    }}
                >
                    <source src="/Reveal-MoodyApe.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video> */}

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
                        <>
                            <NFTAdmin />
                        </>
                    ) : (
                        <>
                            <div className={styles.golden_ticket_title}>GOLDEN TICKET </div>
                            <div className={styles.private_sale_title}>
                                REVEAL YOUR MOODY APE
                            </div>
                            <div>
                                <img className={styles.nft_logo} src="/mac_golden_ticket.gif" />
                            </div>

                            <Col className={styles.mintWrapper}>
                                <div className={styles.private_sale_title}>
                                    Connect your wallet if you want to reveal your NFT
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

export default BackOffice;
