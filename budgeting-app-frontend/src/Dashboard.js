import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [userInfo, setUserInfo] = useState({
    name: 'Loading...', 
    balance: 0,
    recentTransactions: [],
    budgetInfo: {
      general: { spent: 0 },
      groceries: { spent: 0 },
      utilities: { spent: 0 }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return;
      }
  
      try {
        const [userRes, transactionsRes, budgetsRes] = await Promise.all([
          fetch(`/api/current-user`, { credentials: 'include' }),
          fetch(`/api/recentTransactions/${userId}`, { credentials: 'include' }),
          fetch(`/api/budgets/${userId}`, { credentials: 'include' })
        ]);
  
        if (!userRes.ok) throw new Error("Error fetching user data");
        if (!transactionsRes.ok) throw new Error("Error fetching transactions data");
        if (!budgetsRes.ok) throw new Error("Error fetching budget data");
  
        const [userData, transactionsData, budgetsData] = await Promise.all([
          userRes.json(),
          transactionsRes.json(),
          budgetsRes.json()
        ]);
  
        setUserInfo({
          name: userData.data.username || 'No Name', 
          balance: userData.data.balance || 0, 
          recentTransactions: transactionsData,
          budgetInfo: {
            general: { allocated: budgetsData.data.allocations.general || 0, spent: budgetsData.data.totalSpent['General'] || 0 },
            groceries: { allocated: budgetsData.data.allocations.groceries || 0, spent: budgetsData.data.totalSpent['Groceries'] || 0 },
            utilities: { allocated: budgetsData.data.allocations.utilities || 0, spent: budgetsData.data.totalSpent['Utilities'] || 0 }
          }
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setUserInfo(prevState => ({ ...prevState, name: 'Failed to load data' }));
      }
    };
  
    fetchData();
  }, []);  

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {userInfo.name}</h1>
        <div className="balance-info">
        <h2>Balance: ${userInfo.balance ? userInfo.balance.toFixed(2) : 'Loading...'}</h2>
        </div>
      </div>

      <div className="dashboard-main-content">
        <div className="dashboard-sections">
          <div className="transactions-section card">
            <h3>Recent Transactions</h3>
            <ul className="transaction-list">
              {userInfo.recentTransactions.map((transaction) => (
                <li key={transaction.id} className="transaction-item">
                  {transaction.date} - {transaction.description} - ${transaction.amount.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          <div className="budget-section card">
            <h3>Budget Overview</h3>
            <div className="budget-items">
              {Object.entries(userInfo.budgetInfo).map(([category, budget]) => (
                <div key={category} className="budget-item">
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  <p>Spent: ${budget.spent.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-graphs">
          {/* Placeholder for graph components */}
          <div className="card-graph">Graph 1 placeholder</div>
          <div className="card-graph">Graph 2 placeholder</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
