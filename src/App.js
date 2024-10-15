import { useState } from 'react';
import Navigation from './components/Navigation';
import Search from './components/Search';
import logo from './logo.svg';

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

  return (
    <div>
      <Navigation />
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
    </div>
  );
}

export default App;
