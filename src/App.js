// import logo from './logo.svg';
import './App.css';
import getProvider from './utils/getProvider';
import { useState, useEffect } from 'react';

function App() {
  const [pubKey, setPublicKey] = useState();

  const provider = getProvider();

  useEffect(() => {
    // Check if the user has explicitly disconnected
    const isDisconnected = localStorage.getItem('isDisconnected') === 'true';

    if (!isDisconnected) {
      // Attempt to eagerly connect to Phantom
      provider.connect({ onlyIfTrusted: true })
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
    provider.on('accountChanged', async (publicKey) => {
      if (publicKey) {
        // Set new public key and continue as usual
        console.log(`Switched to account ${publicKey.toBase58()}`);
        setPublicKey(publicKey.toString());
      } else {
        // Attempt to reconnect to Phantom
        await provider.connect().catch((error) => {
          // Handle connection failure
          console.log("Didn't show changed account so we will try to reconnect");
        });

        setPublicKey(provider.publicKey.toString());
      }
    });

    // Cleanup event listener on component unmount
    return () => {
      provider.removeAllListeners('accountChanged');
    };
  }, [provider]);

  async function handleConnect() {
    try {
      const response = await provider.connect();
      console.log(response.publicKey.toString());
      setPublicKey(response.publicKey.toString());
      provider.on("connect", () => console.log("connected!"));

      // Clear the disconnected state
      localStorage.setItem('isDisconnected', 'false');
    } catch (err) {
      console.log("error in connecting phantom wallet", err);
    }
  }

  async function handleDisconnect() {
    await provider.disconnect();
    console.log("Phantom wallet disconnected");
    setPublicKey(null);

    // Set the disconnected state
    localStorage.setItem('isDisconnected', 'true');

    // Forget user's public key once they disconnect
    provider.on("disconnect", () => {
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

        {/* <p>wallet connection status : {provider.isConnected}</p> */}

        {pubKey ? <p> Wallet Connected : your public key is : {pubKey} </p> : <p>Wallet Not Connected</p>}
      </header>
    </div>
  );
}

export default App;
