const express = require('express');
const path = require('path');
const db = require('./database.js');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();

const mapCategoryIdToName = (categoryId) => {
    const categoryMapping = {
        '1': 'General',
        '2': 'Groceries',
        '3': 'Utilities',
    };
    return categoryMapping[categoryId.toString()] || 'Uncategorized';
};

app.use(express.json());
app.use(session({
    secret: 'ofe12367',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const saltRounds = 10;

app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, hashedPassword], function (err) {
            if (err) {
                res.status(500).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "User created successfully",
                "data": this.lastID
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "error": "Failed to create user due to internal error" });
    }
});

app.get('/api/getUserId', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ userId: req.session.userId });
    } else {
        res.status(401).json({ message: 'No user session found' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
            if (err) {
                res.status(500).json({ "error": err.message });
                return;
            }
            if (user) {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    req.session.userId = user.id;
                    res.json({
                        "message": "Login successful!",
                        "userId": user.id,
                        "username": user.username,
                        "email": user.email
                    });
                } else {
                    res.status(401).json({ "message": "Incorrect password" });
                }
            } else {
                res.status(404).json({ "message": "User not found" });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "error": "Failed to process login due to internal error" });
    }
});

app.post('/api/transactions', (req, res) => {
    const userId = req.session.userId;
    const { category_id, amount, description, transaction_date } = req.body;
    const sql = `INSERT INTO transactions (user_id, category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?)`;
    const params = [userId, category_id, amount, description, transaction_date || new Date()];
    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "Transaction added successfully",
            "data": this.lastID
        });
    });
});

app.get('/api/allocations/:userId', (req, res) => {
    const { userId } = req.params;
    db.get(`SELECT * FROM allocations WHERE user_id = ?`, [userId], (err, row) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({ "message": "Success", "data": row });
    });
});

app.post('/api/allocations', (req, res) => {
    const userId = req.session.userId;
    const { category, allocated } = req.body;
    const columnName = category.toLowerCase();
    const updateSql = `
        INSERT INTO allocations (user_id, ${columnName})
        VALUES (?, ?)
        ON CONFLICT(user_id)
        DO UPDATE SET ${columnName} = excluded.${columnName};
    `;
    db.run(updateSql, [userId, allocated], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ "error": "Failed to update allocation" });
            return;
        }
        res.json({ "message": "Allocation updated successfully" });
    });
});

app.get('/api/budgets/:userId', (req, res) => {
    const { userId } = req.params;
    
    const transactionsSql = `
        SELECT category_id as category, SUM(amount) as spent
        FROM transactions
        WHERE user_id = ?
        GROUP BY category_id;
    `;

    const allocationsSql = `
        SELECT general, groceries, utilities
        FROM allocations
        WHERE user_id = ?;
    `;

    db.all(transactionsSql, [userId], (err, transactions) => {
        if (err) {
            console.error('Error fetching transactions:', err.message);
            res.status(500).json({ "error": "Error fetching transactions: " + err.message });
            return;
        }

        db.get(allocationsSql, [userId], (allocErr, allocations) => {
            if (allocErr) {
                console.error('Error fetching allocations:', allocErr.message);
                res.status(500).json({ "error": "Error fetching allocations: " + allocErr.message });
                return;
            }

            const totalSpent = transactions.reduce((acc, transaction) => {
                const categoryName = transaction.category; 
                acc[categoryName] = (acc[categoryName] || 0) + transaction.spent;
                return acc;
            }, {});

            const budgetData = {
                totalSpent: totalSpent, 
                allocations: allocations 
            };

            res.json({ "message": "Data retrieved successfully", "data": budgetData });
        });
    });
});

app.get('/api/recentTransactions/:userId', (req, res) => {
    const { userId } = req.params;
    db.all(`SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 5`, [userId], (err, transactions) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json(transactions);
    });
});

app.get('/api/current-user', (req, res) => {
    if (req.session.userId) {
        const userId = req.session.userId;
        db.get(`SELECT username FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) {
                res.status(500).json({ "error": err.message });
                return;
            }
            if (row) {
                res.json({ "message": "User data retrieved successfully", "data": row });
            } else {
                res.status(404).json({ "message": "User not found" });
            }
        });
    } else {
        res.status(401).json({ "message": "No user logged in" });
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'budgeting-app-frontend', 'build')));
app.get('*', (req, res) => {
    console.log("Unhandled request path:", req.path);
    res.sendFile(path.join(__dirname, 'budgeting-app-frontend', 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});