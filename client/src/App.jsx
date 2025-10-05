import React, { useState, useEffect } from 'react';
import { Auth, Header, EmployeeManagement, DepartmentManagement, AdminTools } from './components';

const App = () => {
    const [page, setPage] = useState(1);
    const [authState, setAuthState] = useState({ isAuthenticated: false, token: null, user: null, role: null });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (token) {
            setAuthState(prev => ({ ...prev, isAuthenticated: true, token }));
            setAuthState(prev => ({ ...prev, role: prev.role || 'employee' }));
        }
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setAuthState({ isAuthenticated: false, token: null, user: null, role: null });
        setPage(1);
    };

    if (isLoading) return null;
    if (!authState.isAuthenticated) return <Auth setAuthState={setAuthState} />;

    const renderPage = () => {
        switch (page) {
            case 2:
                return <DepartmentManagement authState={authState} />;
            case 3:
                return <AdminTools authState={authState} />;
            case 1:
            default:
                return <EmployeeManagement authState={authState} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header authState={authState} page={page} setPage={setPage} handleLogout={handleLogout} />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{renderPage()}</main>
        </div>
    );
};

export default App;
