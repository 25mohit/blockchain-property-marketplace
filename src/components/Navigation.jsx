import { FaBitcoin } from "react-icons/fa6";

const Navigation = ({ account, setAccount }) => {

    const connectHandler = async () => {    
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        setAccount(accounts[0])
    }

    return(
        <nav>
            <ul className="nav__links">
                <li><a href="">Buy</a></li>
                <li><a href="">Rent</a></li>
                <li><a href="">Sell</a></li>
            </ul>
            <div className="nav__brand">
                <h1>Millow<FaBitcoin />dApp</h1>
            </div>
            {
                account ? 
                <button type='button' className="nav__connect">{account.slice(0,6)+'...'+account.slice(38,42)}</button> :
                <button type='button' className="nav__connect" onClick={connectHandler}>Connect</button> 

            }
        </nav>
        
    )
}

export default Navigation;
