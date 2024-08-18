import React, { useState } from 'react';
import './TransactionEntry.css';

function TransactionEntry() {
    const [transaction, setTransaction] = useState({
        date: '',
        amount: '',
        category: 'General',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTransaction({ ...transaction, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category_id: transaction.category,
                    amount: transaction.amount,
                    description: transaction.description,
                    transaction_date: transaction.date
                })
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log('Transaction added successfully:', data);
                alert('Transaction added successfully!');
                setTransaction({
                    date: '',
                    amount: '',
                    category: 'General',
                    description: ''
                });
            } else {
                console.error('Failed to add transaction:', data.message);
                alert(data.message);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error, please try again later.');
        }
    };
    

    return (
        <div className="transaction-entry-container">
            <h2>Enter a New Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={transaction.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={transaction.amount}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={transaction.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="General">General</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Utilities">Utilities</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={transaction.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Add Transaction</button>
            </form>
        </div>
    );
}

export default TransactionEntry;
