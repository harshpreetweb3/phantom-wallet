// import logo from './logo.svg';
import './App.css';
import getProvider  from './utils/getProvider';
import { useState } from 'react';


function App() {

  const [publicKey, setPublicKey] = useState();

  const provider = getProvider();

  async function handleConnect() {
    try {
      const response = await provider.connect();
      console.log(response.publicKey.toString())
      setPublicKey(response.publicKey.toString())
      provider.on("connect", () => console.log("connected!"));
    } catch (err) {
      console.log("error in connecting phantom wallet", err);
    }
  }

  async function handleDisconnect() {
    await provider.disconnect();
    console.log("phontom wallet disconnected");
    setPublicKey(null);

    // Forget user's public key once they disconnect
    provider.on("disconnect", () => {
      console.log("disconnected!")
    });
  }

  return (
    <div className="App">

      <header className="App-header">

        <p>wallet connection</p>

        {!publicKey
          ?
          <button onClick={() => { handleConnect() }}>connect to phantom</button>
          :
          <button onClick={() => { handleDisconnect() }}>disconnect phantom wallet</button>
        }

        {/* <p>wallet connection status : {provider.isConnected}</p> */}

        {publicKey ? <p> Wallet Connected :  your public key is : {publicKey} </p> : <p>Wallet Not Connected</p>}

      </header>

     

    </div>
  );
}

export default App;
