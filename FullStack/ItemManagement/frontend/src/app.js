import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ItemList from './ItemList';
import ItemView from './ItemView';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ItemList />} />
                <Route path="/items/:id" element={<ItemView />} />
            </Routes>
        </Router>
    );
};

export default App;