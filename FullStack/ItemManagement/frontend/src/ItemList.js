import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './Api';

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
    });

    const fetchItems = async () => {
        try {
            const response = await api.get('/items/');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
            setItems([]);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/items/', formData);
            setFormData({ name: '', description: '', price: '' });
            fetchItems();
        } catch (error) {
            console.error('Error creating item:', error);
        }
    };

    return (
        <div>
            <nav className='navbar navbar-dark bg-primary'>
                <div className='container-fluid'>
                    <a className='navbar-brand' href='/'>Item Management</a>
                </div>
            </nav>

            <div className='container mt-5'>
                <div className='row justify-content-center'>
                    <div className='col-md-6'>
                        <form onSubmit={handleFormSubmit}>
                            <div className='mb-3'>
                                <label htmlFor="name" className='form-label'>Item Name</label>
                                <input
                                    type="text"
                                    className='form-control'
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className='mb-3'>
                                <label htmlFor="description" className='form-label'>Item Description</label>
                                <input
                                    type="text"
                                    className='form-control'
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className='mb-3'>
                                <label htmlFor="price" className='form-label'>Item Price</label>
                                <input
                                    type="number"
                                    className='form-control'
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>

                            <button type="submit" className='btn btn-primary'>Submit</button>
                        </form>
                    </div>
                </div>
            </div>

            <div className='container'>
                <h2 className='text-center my-4'>Item List</h2>
                <table className='table table-striped table-bordered'>
                    <thead className='thead-dark'>
                        <tr>
                            <th scope='col'>ID</th>
                            <th scope='col'>Name</th>
                            <th scope='col'>Description</th>
                            <th scope='col'>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <Link to={`/items/${item.id}`} className="text-decoration-none">
                                        {item.id}
                                    </Link>
                                </td>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
                                <td>${item.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ItemList;
