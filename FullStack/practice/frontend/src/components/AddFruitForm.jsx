import React, { useState } from 'react';

const AddFruitForm = ({ onAddFruit }) => {
    const [fruitName, setFruitName] = useState('');
   
    const handleSubmit = (e) => {
        e.preventDefault();
        if (fruitName.trim()) {
            onAddFruit(fruitName);
            setFruitName('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={fruitName}
                onChange={(e) => setFruitName(e.target.value)}
                placeholder="Enter fruit name"
                required
            />
            <button type="submit">Add Fruit</button>
        </form>
    );
}

export default AddFruitForm;
