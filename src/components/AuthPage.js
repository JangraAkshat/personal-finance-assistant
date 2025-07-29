import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AuthPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const url = isLogin ? '/api/users/login' : '/api/users/register';
        try {
            const { data } = await axios.post(url, { username, password });
            onLogin(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="auth-layout">
            <form onSubmit={handleSubmit}>
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                </div>
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                 <button type="button" onClick={() => setIsLogin(!isLogin)} style={{marginLeft: '1rem', background: '#6c757d'}}>
                    {isLogin ? 'Need an account?' : 'Already have an account?'}
                </button>
            </form>
        </div>
    );
}

export default AuthPage;
