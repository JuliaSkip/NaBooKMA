import './App.css';
import {BrowserRouter,Routes, Route} from 'react-router-dom';
import CustomerPage from "../AdminPage/CustomersPage";


function App() {
    return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<CustomerPage/>}/>
        </Routes>
    </BrowserRouter>
    );
}

export default App;
