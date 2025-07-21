import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './Api';

const ItemView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/items/${id}`);
                setItem(response.data);
            } catch (error) {
                console.error('Error fetching item:', error);
                setError('Item not found');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchItem();
        }
    }, [id]);

    const handleBack = () => {
        navigate('/');
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/items/${id}`);
            navigate('/');
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('Error deleting item');
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error || 'Item not found'}
                </div>
                <button className="btn btn-primary" onClick={handleBack}>
                    Back to Items
                </button>
            </div>
        );
    }

    return (
        <div>
            <nav className='navbar navbar-dark bg-primary'>
                <div className='container-fluid'>
                    <a className='navbar-brand' href='/'>Item Management</a>
                </div>
            </nav>

            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <h2>Item Details</h2>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <strong>ID:</strong>
                                    </div>
                                    <div className="col-md-9">
                                        {item.id}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <strong>Name:</strong>
                                    </div>
                                    <div className="col-md-9">
                                        {item.name}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <strong>Description:</strong>
                                    </div>
                                    <div className="col-md-9">
                                        {item.description}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <strong>Price:</strong>
                                    </div>
                                    <div className="col-md-9">
                                        ${item.price}
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn btn-primary" onClick={handleBack}>
                                    Back to Items
                                </button>

                                <button className="btn btn-danger" onClick={handleDelete}>
                                    Delete Item
                                </button>

                            
                            </div>
                            
                                
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemView;
