import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';

function Navbar({ userInfo, onLogout }) {
    return (
        <nav>
            <h1><Link to="/" style={{color: '#007bff', textDecoration: 'none'}}>FinancePal</Link></h1>
            <div>
                {userInfo ? (
                    <>
                        <span style={{marginRight: '1rem'}}>Welcome, {userInfo.username}!</span>
                        <button onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}

function App() {
    //putting userInfo in state so the app re-renders when it changes
    const [userInfo, setUserInfo] = useState(null);

    //using useEffect to check localStorage for user info when the app first loads
    //this keeps the user logged in even if they refresh the page
    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }
    }, []);

    const handleLogin = (data) => {
        setUserInfo(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    const handleLogout = () => {
        setUserInfo(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <Router>
            <Navbar userInfo={userInfo} onLogout={handleLogout} />
            <main className="container">
                <Routes>
                    <Route path="/login" element={!userInfo ? <AuthPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={userInfo ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/" element={<Navigate to={userInfo ? "/dashboard" : "/login"} />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;