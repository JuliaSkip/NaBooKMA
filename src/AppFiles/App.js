import './App.css';
import {BrowserRouter,Routes, Route} from 'react-router-dom';
import CustomerPage from "../AdminPage/CustomersPage";
import PurchasesPage from "../AdminPage/PurchasesPage";


function App() {
    return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<CustomerPage/>}/>
            <Route path="/purchases" element={<PurchasesPage/>}/>
        </Routes>
    </BrowserRouter>
    );
}

export default App;
