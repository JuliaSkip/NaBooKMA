import './App.css';
import {BrowserRouter,Routes, Route} from 'react-router-dom';
import CustomerPage from "../AdminPage/CustomersPage";
import PurchasesPage from "../AdminPage/PurchasesPage";
import BooksPage from "../BooksPage/BooksPage";
import Login from "../Login/Login";
import Signup from "../Login/Signup";


function App() {
    return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/customers" element={<CustomerPage/>}/>
            <Route path="/purchases" element={<PurchasesPage/>}/>
            <Route path="/books" element={<BooksPage/>}/>
        </Routes>
    </BrowserRouter>
    );
}

export default App;
