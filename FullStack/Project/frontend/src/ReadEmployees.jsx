import React, { useState } from 'react';



function ReadEmployees(){

    const [employee, setEmployee] = useState([]);

    const loadEmployees = async () => {
        const res = await fetch("http://localhost:8080/api/employees");
        const data = await res.json();
        setEmployee(data);
    }

    return(
        
                  
    );
}

export default ReadEmployees;