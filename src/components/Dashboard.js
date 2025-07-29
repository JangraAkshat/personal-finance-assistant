import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function EditTransactionModal({ transaction, onClose, onSave, categories }) {
    const [formData, setFormData] = useState({
        ...transaction,
        date: new Date(transaction.date).toISOString().slice(0, 10)
    });
    
    const editDateInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <form onSubmit={handleSubmit} style={{ width: '400px' }}>
                <h3>Edit Transaction</h3>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required />
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                
                <div className="date-input-container">
                  <input type="date" name="date" value={formData.date} onChange={handleChange} ref={editDateInputRef} required />
                  <span className="date-input-icon" onClick={() => editDateInputRef.current.showPicker()}>📅</span>
                </div>

                <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                <select name="category" value={formData.category} onChange={handleChange}>
                   {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={onClose} style={{backgroundColor: '#6c757d'}}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

function TransactionList({ transactions, onEdit, onDelete, page, totalPages, onPageChange, onSearch }) {
    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h3>Transaction History</h3>
                <input type="search" placeholder="Search by description..." onChange={(e) => onSearch(e.target.value)}
                    style={{padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc'}} />
            </div>
            <div className="table-container" style={{overflowX: 'auto'}}>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th style={{textAlign: 'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? transactions.map(t => (
                            <tr key={t._id}>
                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                <td>{t.description}<br/><small style={{color: '#666'}}>{t.category}</small></td>
                                <td style={{ color: t.type === 'expense' ? '#dc3545' : '#28a745', whiteSpace: 'nowrap'}}>₹ {t.amount.toFixed(2)}</td>
                                <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                                    <button onClick={() => onEdit(t)} style={{fontSize: '0.8rem', padding: '0.2rem 0.5rem', marginRight: '0.5rem'}}>Edit</button>
                                    <button onClick={() => onDelete(t._id)} style={{fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: '#dc3545'}}>Delete</button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="4" style={{textAlign: 'center', padding: '1rem'}}>No transactions found.</td></tr>}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="pagination" style={{marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next</button>
                </div>
            )}
        </div>
    );
}

function SummaryChart({ data }) {
    const chartData = {
        labels: Object.keys(data),
        datasets: [{
            data: Object.values(data),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            borderWidth: 0,
        }]
    };
    const chartOptions = {
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 20,
                    padding: 20,
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const allData = context.dataset.data || [];
                        const total = allData.reduce((sum, value) => sum + value, 0);
                        const currentValue = context.parsed;
                        const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(2) : 0;
                        let label = context.label || '';
                        if (label) { label += ': '; }
                        if (currentValue !== null) {
                            const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(currentValue);
                            label += `${formattedAmount} (${percentage}%)`;
                        }
                        return label;
                    }
                }
            }
        }
    };
    return (
        <div style={{marginTop: '2rem'}}>
             <h3>Expenses by Category</h3>
             <div className="chart-container">
                {Object.keys(data).length > 0 ? <Pie data={chartData} options={chartOptions} /> : <p>No expense data to display.</p>}
             </div>
        </div>
    );
}

function CategoryManager({ categories, onAdd, onDelete }) {
    const [newCategory, setNewCategory] = useState('');
    const handleAdd = (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAdd(newCategory.trim());
            setNewCategory('');
        }
    };
    return (
        <div>
            <h3>Manage Categories</h3>
            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', marginBottom: '1rem'}}>
                {categories.map(cat => (
                    <li key={cat} style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee'}}>
                        {cat}
                        <button onClick={() => onDelete(cat)} style={{background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1rem'}}>✖</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAdd} style={{display: 'flex', gap: '0.5rem'}}>
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" style={{flexGrow: 1}}/>
                <button type="submit" style={{padding: '0.5rem 1rem'}}>Add</button>
            </form>
        </div>
    );
}

function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [summaryData, setSummaryData] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [form, setForm] = useState({ description: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10) });
    const [error, setError] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTransaction, setEditingTransaction] = useState(null);
    
    const addDateInputRef = useRef(null);

    //responsible for making all necessary API calls to backend
    //uses Promise.all (more efficient, fetches data concurrently)
    const fetchData = useCallback(async () => {
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            setError(''); // Clear previous errors
            const [transRes, summaryRes, catRes] = await Promise.all([
                axios.get(`/api/transactions?page=${page}&search=${searchQuery}`, config),
                axios.get('/api/transactions/summary', config),
                axios.get('/api/categories', config)
            ]);
            setTransactions(transRes.data.transactions);
            setTotalPages(transRes.data.pages);
            setSummaryData(summaryRes.data.expenses_by_category);
            setCategories(catRes.data);
            if (catRes.data.length > 0 && !form.category) {
                setForm(prev => ({...prev, category: catRes.data[0]}));
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
            setError("Failed to load dashboard data. Please try again.");
        }
    }, [page, searchQuery, form.category]); // Correct dependency array

    
    //calls fetchData whenever it's recreated and updates the dashboard when user changes pages or searches
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        setPage(1);
    };

    const handleAddCategory = async (category) => {
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const { data } = await axios.post('/api/categories', { category }, config);
            setCategories(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add category');
        }
    };
    
    const handleDeleteCategory = async (category) => {
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const config = { 
            headers: { Authorization: `Bearer ${token}` },
            data: { category }
        };
        try {
            const { data } = await axios.delete('/api/categories', config);
            setCategories(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete category');
        }
    };

    const handleFormChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!form.category) {
            setError("Please add a category before adding a transaction.");
            return;
        }
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.post('/api/transactions', form, config);
            setForm({ description: '', amount: '', type: 'expense', category: categories[0] || '', date: new Date().toISOString().slice(0, 10) });
            fetchData();
        } catch (err) {
            setError('Failed to add transaction.');
        }
    };

    const handleReceiptUpload = async (e) => {
        e.preventDefault();
        if (!receiptFile) return;
        setIsScanning(true);
        setError('');
        const formData = new FormData();
        formData.append('receipt', receiptFile);
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const config = { headers: { 'Content-Type': 'multipart-form-data', Authorization: `Bearer ${token}` } };
        try {
            const { data } = await axios.post('/api/transactions/upload-receipt', formData, config);
            setForm({ ...form, amount: data.amount.toFixed(2), description: data.description, type: 'expense' });
        } catch (err) {
            setError(err.response?.data?.message || 'Could not process receipt.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleOpenEditModal = (transaction) => {
        setEditingTransaction(transaction);
    };

    const handleCloseEditModal = () => {
        setEditingTransaction(null);
    };

    const handleUpdateTransaction = async (updatedData) => {
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.put(`/api/transactions/${updatedData._id}`, updatedData, config);
            handleCloseEditModal();
            fetchData();
        } catch (err) {
            setError('Failed to update transaction.');
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                await axios.delete(`/api/transactions/${id}`, config);
                fetchData();
            } catch (err) {
                setError('Failed to delete transaction.');
            }
        }
    };

    return (
        <div>
            {editingTransaction && (
                <EditTransactionModal 
                    transaction={editingTransaction} 
                    onClose={handleCloseEditModal}
                    onSave={handleUpdateTransaction}
                    categories={categories}
                />
            )}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <div className="dashboard-layout">
                <div>
                    <form onSubmit={handleAddTransaction}>
                        <h3>Add New Transaction</h3>
                        <input type="text" name="description" value={form.description} onChange={handleFormChange} placeholder="Description" required />
                        <input type="number" name="amount" value={form.amount} onChange={handleFormChange} placeholder="Amount" required />
                        
                        <div className="date-input-container">
                            <input type="date" name="date" value={form.date} onChange={handleFormChange} ref={addDateInputRef} required />
                            <span className="date-input-icon" onClick={() => addDateInputRef.current.showPicker()}>📅</span>
                        </div>

                        <select name="type" value={form.type} onChange={handleFormChange}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                        <select name="category" value={form.category} onChange={handleFormChange}>
                           {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <button type="submit">Add Transaction</button>
                    </form>

                    <form onSubmit={handleReceiptUpload}>
                        <h3>Or Upload a Receipt</h3>
                        <input 
                            type="file" 
                            onChange={e => setReceiptFile(e.target.files[0])} 
                            accept="image/*,application/pdf" 
                        />
                        <button type="submit" disabled={isScanning}>
                            {isScanning ? 'Scanning...' : 'Scan Receipt'}
                        </button>
                    </form>

                    <div style={{marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                       <CategoryManager categories={categories} onAdd={handleAddCategory} onDelete={handleDeleteCategory} />
                    </div>
                </div>
                <div>
                    <TransactionList 
                        transactions={transactions} 
                        page={page} 
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onSearch={handleSearch}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteTransaction}
                    />
                    <SummaryChart data={summaryData} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;