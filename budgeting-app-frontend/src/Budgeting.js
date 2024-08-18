import React, { useState, useEffect } from 'react';
import './Budgeting.css';

function Budgeting() {
    const [budgets, setBudgets] = useState([]);
    const [current, setCurrent] = useState(0);
    const [category, setCategory] = useState('General');
    const [allocated, setAllocated] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
          try {
            const response = await fetch('/api/getUserId');
            const data = await response.json();
            if (data.userId) {
              setUserId(data.userId);
            } else {
              console.error('User ID not found in session');
            }
          } catch (error) {
            console.error('Error fetching user ID:', error);
          }
        };
      
        fetchUserId();
      }, []);      

      useEffect(() => {
        if (userId) {
          fetchBudgets(userId);
        }
      }, [userId]); 

    const CATEGORY_NAMES = {
        'Groceries': 'Groceries',
        'General': 'General',
        'Utilities': 'Utilities'
    };

    const getCategoryNameById = (id) => {
        return CATEGORY_NAMES[id] || 'Uncategorized';
    };

    const fetchBudgets = async (userId) => {
        try {
            const response = await fetch(`/api/budgets/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
    
            if (result && result.data) {
                const { totalSpent, allocations } = result.data;
                const categories = ['General', 'Groceries', 'Utilities'].map(key => ({
                    category: key,
                    spent: totalSpent[key] || 0,
                    allocated: allocations[key.toLowerCase()] || 0 
                }));
    
                setBudgets(categories);
            } else {
                console.error('Unexpected data structure:', result);
            }
        } catch (error) {
            console.error('Failed to fetch budgets:', error.message);
        }
    };
    
    
    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };

    const handleAllocatedChange = (event) => {
        setAllocated(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const categoryLowerCase = category.toLowerCase();

        try {
            const response = await fetch('/api/allocations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category: categoryLowerCase, allocated }),
            });

            if (response.ok) {
                fetchBudgets();
                setCategory('General');
                setAllocated('');
            } else {
                const errorData = await response.json();
                console.error('Failed to submit budget', errorData.message);
                alert(errorData.message || 'Failed to update budget');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Unable to connect to the server. Please try again later.');
        }
    };

    const nextPage = () => {
        setCurrent((current + 1) % budgets.length);
    };

    const prevPage = () => {
        setCurrent((current - 1 + budgets.length) % budgets.length);
    };

    return (
        <div className="budgeting-container">
            <h2>Budget Overview</h2>
            {budgets.length > 0 && (
                <>
                    <button onClick={prevPage} disabled={budgets.length <= 1}>Previous</button>
                    <div className="budget-display">
                        <div className="budget-card">
                            <h3>{budgets[current].category}</h3>
                            <p>Allocated: ${budgets[current].allocated.toFixed(2)}</p>
                            <p>Spent: ${(budgets[current].spent || 0).toFixed(2)}</p>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${(budgets[current].spent / budgets[current].allocated) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <button onClick={nextPage} disabled={budgets.length <= 1}>Next</button>
                </>
            )}
            <form onSubmit={handleSubmit} className="budget-form">
                <select value={category} onChange={handleCategoryChange}>
                    <option value="General">General</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities">Utilities</option>
                </select>
                <input type="number" value={allocated} onChange={handleAllocatedChange} placeholder="Allocated Amount" />
                <button type="submit">Add/Update Budget</button>
            </form>
            {budgets.length === 0 && <p>No budget data available.</p>}
        </div>
    );
}

export default Budgeting;