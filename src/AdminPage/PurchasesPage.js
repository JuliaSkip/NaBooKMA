import MenuBar from "../MenuBar/MenuBar";
import React, {useEffect, useState} from "react";

function PurchasesPage(){
    const [fetchError, setFetchError] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [sortBy, setSortBy] = useState("check_number");
    const [sortOrder, setSortOrder] = useState("ASC");
    
    return(
        <div>
            <MenuBar/>
        </div>
    );
}

export default PurchasesPage;