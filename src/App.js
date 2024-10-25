import './App.css';
import getProvider from './utils/getProvider';
import { useState, useEffect } from 'react';
import { useSDK } from "@metamask/sdk-react";

function App() {

  const [account, setAccount] = useState("");
  const { sdk, connected, connecting, provider, chainId } = useSDK();

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  const [pubKey, setPublicKey] = useState();
  const phantom_provider = getProvider();

  useEffect(() => {
    // Check if the user has explicitly disconnected
    const isDisconnected = localStorage.getItem('isDisconnected') === 'true';

    if (!isDisconnected) {
      // Attempt to eagerly connect to Phantom
      phantom_provider.connect({ onlyIfTrusted: true })
        .then(({ publicKey }) => {
          // Handle successful eager connection
          console.log(publicKey.toString());
          setPublicKey(publicKey.toString());
        })
        .catch((err) => {
          // Handle connection failure as usual
          console.log("Eager connection failed", err);
        });
    }

    // Set up event listener for account changes
    phantom_provider.on('accountChanged', async (publicKey) => {
      if (publicKey) {
        // Set new public key and continue as usual
        console.log(`Switched to account ${publicKey.toBase58()}`);
        setPublicKey(publicKey.toString());
      } else {
        // Attempt to reconnect to Phantom
        await phantom_provider.connect().catch((error) => {
          // Handle connection failure
          console.log("Didn't show changed account so we will try to reconnect");
        });

        setPublicKey(phantom_provider.publicKey.toString());
      }
    });

    // Cleanup event listener on component unmount
    return () => {
      phantom_provider.removeAllListeners('accountChanged');
    };
  }, [phantom_provider]);

  async function handleConnect() {
    try {
      const response = await phantom_provider.connect();
      console.log(response.publicKey.toString());
      setPublicKey(response.publicKey.toString());
      phantom_provider.on("connect", () => console.log("connected!"));

      // Clear the disconnected state
      localStorage.setItem('isDisconnected', 'false');
    } catch (err) {
      console.log("error in connecting phantom wallet", err);
    }
  }

  async function handleDisconnect() {
    await phantom_provider.disconnect();
    console.log("Phantom wallet disconnected");
    setPublicKey(null);

    // Set the disconnected state
    localStorage.setItem('isDisconnected', 'true');

    // Forget user's public key once they disconnect
    phantom_provider.on("disconnect", () => {
      console.log("disconnected!");
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>wallet connection</p>

        {!pubKey
          ? <button onClick={() => { handleConnect() }}>connect to phantom</button>
          : <button onClick={() => { handleDisconnect() }}>disconnect phantom wallet</button>
        }

        {/* <p>wallet connection status : {phantom_provider.isConnected}</p> */}

        {pubKey ? <p> Wallet Connected : your public key is : {pubKey} </p> : <p>Wallet Not Connected</p>}

        {/* metamask wallet integration */}

        <button style={{ padding: 10, margin: 10 }} onClick={connect}>
          Connect
        </button>

        {connected && (
        <div>
          <>
            {chainId && `Connected chain: ${chainId}`}
            <p></p>
            {account && `Connected account: ${account}`}
          </>
        </div>
      )}

      </header>
    </div>
  );
}

export default App;
