import { useEffect, useState } from "react";
import { Button, Col, Spinner, Card, Row } from "react-bootstrap";
import styles from "./Claimer.module.scss";
import { useWeb3React } from "@web3-react/core";
import contractABI from "../../WalletHelpers/babyContractABI.json";
import { useMoralisWeb3Api } from "react-moralis";
import { GetMerkleProofId, GetRootId } from '../merkleId';
import idsList from '../ids';

const Claimer = (): JSX.Element => {
  const Web3Api = useMoralisWeb3Api();
  const { account, library } = useWeb3React();
  const [hash, setHash] = useState<string>("");
  const [transactionReceipt, setTransactionReceipt] = useState<any>(null);
  const [userNFTs, setUserNFTs] = useState<any[] | undefined>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);

  // Change to contract address on mainnet BABY CONTRACT
  const contractAddress = "0x03c19E3ed3A3C7D2404AD5c6732051f0c7BB4C5d";
  const contract = new library.eth.Contract(
    contractABI as any,
    contractAddress
  );
  const openSeaLink = `https://testnets.opensea.io/assets/${contractAddress}/`;
  const transactionLink = `https://rinkeby.etherscan.io/tx/${hash}`;

  useEffect(() => {
    (async () => {
      if (!!account && !!library) {
        const getUserNFTs = await Web3Api.account.getNFTsForContract({
          chain: "rinkeby",
          address: account,
          token_address: "0x787Fc8eAd1968550D72037a995D9492E55fd3764", //change for contract address on mainnet MOODY CONTRACT
        });

        let userNFTData = [];

        if (getUserNFTs?.result) {
          for (let i = 0; i < getUserNFTs?.result.length; i++) {
            const isClaimed = await contract.methods.tokenIdUsedForGiveaway(
              getUserNFTs?.result[i]?.token_id
            ).call();
            userNFTData.push({ ...getUserNFTs?.result[i], isClaimed });
          }
        }

        setUserNFTs(userNFTData);
        setFetchingData(false);
      }
    })();
  }, [account, library]);

  const confirmationMessage = () => {
    let babyOpenseaLink = "";

    if (transactionReceipt) {
      const nftId = transactionReceipt?.events?.TransferSingle?.returnValues?.id;
      babyOpenseaLink = openSeaLink + nftId;
    }

    return (
      <>
        <h3>Congratulations!</h3>
        <h4>
          See on opensea here:{'  '}
          <div key={babyOpenseaLink}>
            <a target='_blank' href={babyOpenseaLink} rel='noreferrer'>
              Baby Moody
            </a>
          </div>
        </h4>
      </>
    );
  };

  const NFTCards = () => {
    const userCards = userNFTs?.map((e: any) => {
      if (!idsList.includes(e.token_id)) return;

      return (
        <>
          <Col
            key={e.token_id}
            md={3}
            className={styles.cardWrapper}
          >
            <Card className={styles.card}>
              <Card.Img className={styles.img} src="../mac_golden_ticket.gif" />
              <Card.Body className={styles.cardBody}>
                <Card.Text>MoodyApe: {+e.token_id}</Card.Text>
                <Card.Text>
                </Card.Text>
                <Button
                  className={styles.button}
                  onClick={() => claimBaby(e.token_id)}
                  disabled={e.isClaimed}
                >
                  {e.isClaimed ? "CLAIMED" : "CLAIM NOW"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </>
      );
    });

    return userCards;
  };

  const claimBaby = async (tokenId: string): Promise<void> => {
    if (!!account && !!library) {
      setError("");
      setLoading(true);
      const proof = GetMerkleProofId(tokenId);
      const root = GetRootId();
      console.log(root);
      console.log(proof);

      if (!(await contract.methods.isActive().call()) || !(await contract.methods.isFreeMintActive().call())) {
        alert("Claim has not started yet");
        setLoading(false);
        return;
      }

      if (!proof.length) {
        alert('This Moody Ape can not claim a Baby Ape')
        setLoading(false);
        return;
      }

      const transactionParameters = {
        from: account,
      };

      contract.methods
        .freeMint(tokenId, proof)
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
    <>
      <Row>
        <div className={styles.private_sale_title}>
          Baby Ape Free Mint
        </div>
      </Row>
      <Col className={styles.BOContainer}>
        {fetchingData && <Spinner animation='border' />}

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

export default Claimer;
