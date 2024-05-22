import './MenuBarStyles.css';
import nabookma from './NaBOOKMA__1_-removebg-preview.png'

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
                </ul>
            </nav>
        </header>
    );
};

export default MenuBar;