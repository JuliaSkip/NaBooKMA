import './MenuBarStyles.css';
import nabookma from './NaBOOKMA__1_-removebg-preview.png'
import {NavLink} from "react-router-dom";

/*
<li className="nav-item">
    <NavLink to="/" className="nav-link" activeClassName="active">Customers</NavLink>
</li>
 */
const MenuBar = () => {
    return (
        <header className="menu-bar">
            <nav className="navbar">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <span className="nabookma">Na<span className="book">BooK</span>MA</span>
                    </li>
                    <img src={nabookma} alt="Your Alt Text"/>
                    <li className="nav-item">
                        <NavLink to="/" className="nav-link" activeClassName="active">Customers</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/purchases" className="nav-link" activeClassName="active">Purchases</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/books" className="nav-link" activeClassName="active">Books</NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default MenuBar;