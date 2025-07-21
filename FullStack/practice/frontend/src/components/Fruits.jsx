import React, { useState, useEffect } from 'react';
import AddFruitForm from './AddFruitForm';
import apiClient from '../api';

const FruitsList = () => {
    const[fruits, setFruits] = useState([]);

    const fetchFruits = async () => {
        try {
            const response = await apiClient.get('/fruits');
            setFruits(response.data.fruits || []);
        } catch (error) {
            console.error('Error fetching fruits:', error);
            setFruits([]); // Set empty array on error to prevent map error
        }
    }

    const addFruit = async (fruitName) => {
        try {
            const response = await apiClient.post('/fruits', { name: fruitName });
            setFruits([...fruits, response.data]);
        } catch (error) {
            console.error('Error adding fruit:', error);
        }
    }

    useEffect(() => {
        fetchFruits();
    }, []);

    return (
        <div>
            <h2>Fruits List</h2>
            <ul>
                {Array.isArray(fruits) && fruits.map(fruit => (
                    <li key={fruit.id || fruit.name}>{fruit.name}</li>
                ))}
            </ul>
            <AddFruitForm onAddFruit={addFruit} />
        </div>
    );
};

export default FruitsList;