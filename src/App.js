import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';
import { ethers } from 'ethers';
import config from './config.json';
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// const ethers = require("ethers")

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)
  const [homes, setHomes] = useState([])
  const [openedHome, setOpenedHome] = useState([])
  const [toogle, setToogle] = useState(false)
  
  const onToogleProp = (dt) => {
    setOpenedHome(dt)
    setToogle(!toogle)
    console.log(toogle);
  }
  
  const loadBlockchainData = async () => {
    const prov = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(prov)

    const network = await prov.getNetwork()
    
    const realEstat = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    const totalSupply = await realEstat.totalSupply()
    console.log(network, realEstat, totalSupply.toString());
    const home = [];

    
    for(let i=0;i< totalSupply;i++){
      const uri = await realEstat.tokenURI(i+1)
      
      const res = await fetch(uri)
      const metadata = await res.json()
      // console.log(res, metadata);
      home.push(metadata)
    }
    setHomes(home)
    console.log(homes);
    
    // console.log("realEstate", realEstate);
    
    const escro = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escro)
    // config[network.chainId].realEstate.address
    // config[network.chainId].escrow.address

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)
    })
    
  }

  useEffect(() => {
    loadBlockchainData()
  },[])

  console.log(homes);
  
  return (
    <div>
      <Navigation setAccount={setAccount} account={account}/>
      <Search />
      <div className='cards__section'>
        <h3>Homes for you</h3>
        <hr />
        <div className='cards'>
          <div className='card' onClick={() => onToogleProp()}>
            <div className='card__image'>
              <img src="" />
            </div>
            <div className='card__info'>
              <h4>asdasd ETH</h4>
              <p>
              <strong>asdasd</strong> bds |
              <strong>asdasd</strong> ba |
              <strong>asdasd</strong> sqft |
              </p>
              <p>sdfsdf</p>
            </div>
          </div>
        </div>
      </div>
      {
        toogle && <Home account={account} home={openedHome} provider={provider} escrow={escrow} toggleProp={onToogleProp}/>
      }
    </div>
  );
}

export default App;
