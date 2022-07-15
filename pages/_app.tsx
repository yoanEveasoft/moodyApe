import '../styles/globals.css'
import Head from 'next/head';
import type { AppProps } from 'next/app'
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';

function getLibrary(provider: any): Web3 {
  return new Web3(provider);
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Head>
        <title>Moody Ape Club</title>
        <meta name='description' content='Moody Ape Club NFT' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Component {...pageProps} />
    </Web3ReactProvider>
  )
}

export default MyApp
