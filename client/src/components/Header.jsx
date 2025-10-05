import React from 'react';
import { LogOut, Users, Building, Settings } from 'lucide-react';
import Button from './Button';

const Header = ({ authState, page, setPage, handleLogout }) => {
    const navItems = [
        { id: 1, name: 'Employees', icon: Users },
        { id: 2, name: 'Departments', icon: Building },
    ];

    if (authState.role === 'admin') {
        navItems.push({ id: 3, name: 'Admin Tools', icon: Settings });
    }

    return (
        <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">EMS</span>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden sm:flex space-x-4 items-center">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setPage(item.id)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${page === item.id ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <item.icon size={18} />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </nav>

                    {/* User Info and Logout */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
                            Logged in as: <span className="font-semibold">{authState.user?.email || 'User'}</span>
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                                {authState.role}
                            </span>
                        </div>
                        <Button onClick={handleLogout} icon={LogOut} variant="danger" title="Logout" className="p-2 sm:p-0">
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation (Bottom Bar) */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-20">
                <div className="flex justify-around items-center h-14">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setPage(item.id)}
                            className={`flex flex-col items-center p-2 text-xs transition duration-150 ease-in-out ${page === item.id ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;
