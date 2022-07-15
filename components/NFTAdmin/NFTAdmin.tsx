import { useEffect, useState } from "react";
import { Button, Col, Spinner, Card, Row } from "react-bootstrap";
import styles from "./NFTAdmin.module.scss";
import { useWeb3React } from "@web3-react/core";
import contractABI from "../../WalletHelpers/contractAbi.json";
import { useMoralisWeb3Api } from "react-moralis";

const NFTAdmin = () => {
    const Web3Api = useMoralisWeb3Api();
    const { account, library } = useWeb3React();
    const [hash, setHash] = useState<string>("");
    const [transactionReceipt, setTransactionReceipt] = useState<any>(null);
    const [userNFTs, setUserNFTs] = useState<any[] | undefined>([]);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const transactionLink = `https://etherscan.io/tx/${hash}`;
    const contractAddress = "0xE534bD009274F9b891f80e3E42475f92e439f20c";
    const openSeaLink = `https://opensea.io/assets/${contractAddress}/`;
    const contract = new library.eth.Contract(
        contractABI as any,
        contractAddress
    );

    useEffect(() => {
        (async () => {
            if (!!account && !!library) {
                const getUserNFTs = await Web3Api.account.getNFTsForContract({
                    chain: "eth",
                    address: account,
                    token_address: contractAddress,
                });
                let userNFTData = [];

                if (getUserNFTs?.result) {
                    for (let i = 0; i < getUserNFTs?.result.length; i++) {
                        // const getImage = await getNFTMetadata(getUserNFTs?.result[i]?.token_uri);
                        const isReveal = await getRevealStatus(
                            getUserNFTs?.result[i]?.token_id
                        );
                        userNFTData.push({ ...getUserNFTs?.result[i], isReveal });
                    }
                }

                setUserNFTs(userNFTData);
            }
        })();
    }, [account, library]);

    const getRevealStatus = async (id: any) => {
        return await contract.methods.revealedNFT(id).call();
    };

    // const getNFTMetadata = async (token_uri: string | undefined): Promise<any> => {
    //     if (!token_uri) return '';

    //     try {
    //         const metadata = await fetch(token_uri, { mode: 'no-cors' });
    //         const json = await metadata.json();
    //         return json.image;
    //     } catch {
    //         console.log('error geting metadata');
    //         return '';
    //     }
    // }

    const confirmationMessage = () => {
        return <p>this is the confirmation message</p>;
    };

    const NFTCards = () => {
        const userCards = userNFTs?.map((e: any) => {
            return (
                <Col
                    key={e.token_id}
                    md={3}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "20px",
                        marginRight: "20px",
                        minWidth: "fit-content",
                        height: "70vh",
                    }}
                >
                    <Card className={styles.card}>
                        <Card.Img className={styles.img} src="../mac_golden_ticket.gif" />
                        {/* <img src={`https://gateway.pinata.cloud/${e.image.replace('://', '/')}`} alt='nft image' /> */}
                        <Card.Body className={styles.cardBody}>
                            <Card.Text>Number: {e.token_id}</Card.Text>
                            <Card.Text>
                                Status: {e.isReveal ? "REVEALED" : "Not revealed"}
                            </Card.Text>
                            <Button
                                className={styles.button}
                                disabled={e.isReveal}
                                onClick={() => revealNFT(+e.token_id)}
                            >
                                {e.isReveal ? "REVEALED" : "REVEAL NOW"}
                            </Button>
                            <Card.Text>
                                <a href={openSeaLink + e.token_id} target="_blank" rel="noreferrer">
                                    <img className={styles.emoji} src="/5.png" />
                                </a>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            );
        });

        return userCards;
    };

    const revealNFT = async (id: number): Promise<void> => {
        if (!!account && !!library) {
            setError("");
            setLoading(true);

            if (!(await contract.methods.canReveal().call())) {
                alert("Reveal option is not active");
                setLoading(false);
                return;
            }

            contract.methods
                .revealNFT(id)
                .send({ from: account })
                .on("transactionHash", function (hash: any) {
                    setHash(hash);
                })
                .on("receipt", function (receipt: any) {
                    setTransactionReceipt(receipt);
                    setLoading(false);
                })
                .on("error", function (error: any, receipt: any) {
                    setError(error.message);
                    console.log("this is the error:", error.message);
                    setLoading(false);
                });
        }
    };

    return (
        <>
            <Row>
                <div className={styles.private_sale_title}>
                    In your wallet you have {userNFTs?.length} Moody Ape
                </div>
            </Row>
            <Col className={styles.BOContainer}>
                {userNFTs && (
                    <Row
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        {NFTCards()}
                    </Row>
                )}
                <Col className="text-center">
                    {hash && (
                        <p>
                            ✅ Check out your transaction on Etherscan{" "}
                            <a href={transactionLink} target="_blank" rel="noreferrer">
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
                            Waiting for transaction <Spinner animation="border" size="sm" />
                        </h3>
                    )}

                    {transactionReceipt && confirmationMessage()}
                </Col>
            </Col>
        </>
    );
};

export default NFTAdmin;
