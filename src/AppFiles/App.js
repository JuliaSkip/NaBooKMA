import './App.css';
import {BrowserRouter,Routes, Route} from 'react-router-dom';
import CustomerPage from "../AdminPage/CustomersPage";
import PurchasesPage from "../AdminPage/PurchasesPage";
import BooksPage from "../BooksPage/BooksPage";
import Login from "../Login/Login";
import Signup from "../Login/Signup";
import nabookma from './nabookma_main.jpg'
import MenuBar from "../MenuBar/MenuBar";
import CustomerProfile from "../CustomerPages/CustomerProfile";
const PhotoComponent = () => {
    const containerStyle = {
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${nabookma})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };


    return (
        <div>
            <MenuBar/>
            <div style={containerStyle}></div>
        </div>

    );
};


function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/nabookma" element={<PhotoComponent/>}/>
            <Route path="/customers" element={<CustomerPage/>}/>
            <Route path="/purchases" element={<PurchasesPage/>}/>
            <Route path="/books" element={<BooksPage/>}/>
            <Route path="/me" element={<CustomerProfile/>}/>
        </Routes>
    </BrowserRouter>
    );
}

export default App;
