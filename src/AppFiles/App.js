import './App.css';
import {BrowserRouter,Routes, Route} from 'react-router-dom';
import CustomerPage from "../AdminPage/CustomersPage";
import PurchasesPage from "../AdminPage/PurchasesPage";
import BooksPage from "../BooksPage/BooksPage";


function App() {
    return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<CustomerPage/>}/>
            <Route path="/purchases" element={<PurchasesPage/>}/>
            <Route path="/books" element={<BooksPage/>}/>
        </Routes>
    </BrowserRouter>
    );
}

export default App;
