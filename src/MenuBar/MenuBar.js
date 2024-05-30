import './MenuBarStyles.css';
import nabookma from './NaBOOKMA__1_-removebg-preview.png'
import {NavLink} from "react-router-dom";
import basketIcon from './basket.png';
import React, {useState} from "react";

const MenuBar = () => {
    const [showPopup, setShowPopup] = useState(false);


    const handleBasket = () =>{
        if(showPopup){
            setShowPopup(false)
        }else{
            setShowPopup(true)
        }
    }
    return (
        <div>
            {showPopup && (
                <div className="overlay-basket show">
                    <div className="basket-content">
                        <h2>Your Basket</h2>
                        {}
                    </div>
                </div>
            )}
            <header className="menu-bar">
            <nav className="navbar">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <span className="nabookma">Na<span className="book">BooK</span>MA</span>
                    </li>
                    <img src={nabookma} alt="Your Alt Text"/>
                    <li className="nav-item">
                        <NavLink to="/customers" className="nav-link" activeClassName="active">Customers</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/purchases" className="nav-link" activeClassName="active">Purchases</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/books" className="nav-link" activeClassName="active">Books</NavLink>
                    </li>
                    <li className="nav-item basket-icon">
                        <img src={basketIcon} alt="Basket" onClick={handleBasket}/>
                    </li>
                    <li className="nav-item log-out">
                        <NavLink to="/" className="nav-link" activeClassName="active">Log out</NavLink>
                    </li>

                </ul>
            </nav>
            </header>
        </div>
    );
};

export default MenuBar;