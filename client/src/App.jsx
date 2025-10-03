import React, { useState, useEffect } from 'react';
import { LogOut, Users, Building, Plus, X, Edit, Search, Settings, Link as LinkIcon, Slash, Filter } from 'lucide-react';

// --- CONFIGURATION ---
// IMPORTANT: Change this base URL if your backend server runs on a different location.
const API_BASE_URL = 'http://localhost:3000/api';
const EMPLOYEE_ROLES = ['employee', 'HR', 'admin']; // Available roles for assignment
const ADMIN_CREATION_ROLES = ['HR', 'admin']; // Roles an admin can create

// Utility function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// --- HELPER COMPONENTS ---

/**
 * Custom Modal Component for Add/Edit forms and confirmation messages.
 */
const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                <button 
                    onClick={onClose} 
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition"
                >
                    <X size={20} />
                </button>
            </div>
            {children}
        </div>
    </div>
);

/**
 * Reusable Button Component
 */
const Button = ({ children, onClick, variant = 'primary', icon: Icon, disabled = false, type = 'button' }) => {
    let classes = 'px-4 py-2 rounded-lg font-semibold transition duration-200 shadow-md flex items-center justify-center space-x-2 whitespace-nowrap ';

    switch (variant) {
        case 'secondary':
            classes += 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50';
            break;
        case 'danger':
            classes += 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50';
            break;
        case 'success':
            classes += 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50';
            break;
        case 'disabled':
            classes += 'bg-gray-400 text-white cursor-not-allowed';
            break;
        case 'primary':
        default:
            classes += 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50';
            break;
    }

    return (
        <button type={type} onClick={onClick} className={classes} disabled={disabled || variant === 'disabled'}>
            {Icon && <Icon size={18} />}
            <span>{children}</span>
        </button>
    );
};

// --- AUTHENTICATION COMPONENT ---

const Auth = ({ setAuthState }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const endpoint = isLogin ? '/auth/login' : '/auth/signup';
        const method = 'POST';

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login or signup
                if (data.token) {
                    // Store token in local storage and update main App state
                    localStorage.setItem('jwt', data.token);
                    setAuthState({
                        token: data.token,
                        user: data.data.user,
                        isAuthenticated: true,
                        role: data.data.user.role 
                    });
                } else if (!isLogin) {
                    setMessage('Registration successful! Please log in.');
                    setIsLogin(true); // Switch to login after successful signup
                }
            } else {
                setMessage(`Error: ${data.message || (data.errors ? data.errors.join(', ') : 'Authentication failed.')}`);
            }
        } catch (error) {
            setMessage('Network error or server unreachable.');
            console.error('Auth Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
                    {isLogin ? 'Sign In' : 'Register'} to HRMS
                </h2>
                {message && (
                    <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <Button type="submit" disabled={isLoading} icon={isLogin ? LogOut : Plus} variant="primary" className="w-full">
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
                        </Button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition font-medium"
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- DEPARTMENT MANAGEMENT COMPONENT ---

const DepartmentManagement = ({ authState }) => {
    const [departments, setDepartments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState(null);
    const [deptName, setDeptName] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const canManage = authState.role === 'admin' || authState.role === 'HR';

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/departments`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setDepartments(data.data.departments || []);
            } else {
                setMessage('Failed to fetch departments.');
            }
        } catch (error) {
            setMessage('Network error while fetching departments.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [authState.token]);

    const openModal = (department = null) => {
        setCurrentDept(department);
        setDeptName(department ? department.name : '');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        const method = currentDept ? 'PUT' : 'POST';
        const endpoint = currentDept ? `/departments/${currentDept._id}` : '/departments';

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify({ name: deptName }),
            });

            if (response.ok) {
                setMessage(`Department ${currentDept ? 'updated' : 'added'} successfully!`);
                setModalOpen(false);
                fetchDepartments();
            } else {
                const data = await response.json();
                setMessage(`Failed to save: ${data.message || 'Check network.'}`);
            }
        } catch (error) {
            setMessage('Network error during save operation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (deptId) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/departments/${deptId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.ok) {
                setMessage('Department deleted successfully!');
                fetchDepartments();
            } else {
                const data = await response.json();
                setMessage(`Failed to delete: ${data.message || 'Check network.'}`);
            }
        } catch (error) {
            setMessage('Network error during delete operation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                    <Building size={28} />
                    <span>Department Management</span>
                </h2>
                {canManage && (
                    <Button onClick={() => openModal()} icon={Plus} variant="primary">
                        Add New Department
                    </Button>
                )}
            </div>
            {message && (
                <div className={`p-3 mb-4 text-sm font-medium ${message.startsWith('Error') || message.startsWith('Failed') ? 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300' : 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'} rounded-lg`}>
                    {message}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading departments...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employees</th>
                                {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {departments.length > 0 ? departments.map((dept, index) => (
                                <tr key={dept._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{dept.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {/* This requires a separate API call in a real app to count employees */}
                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">N/A</span>
                                    </td>
                                    {canManage && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button onClick={() => openModal(dept)} icon={Edit} variant="secondary">
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDelete(dept._id)} icon={X} variant="danger">
                                                Delete
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={canManage ? 4 : 3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No departments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {modalOpen && (
                <Modal title={currentDept ? 'Edit Department' : 'Add New Department'} onClose={() => setModalOpen(false)}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label htmlFor="deptName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department Name</label>
                            <input
                                id="deptName"
                                type="text"
                                required
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button onClick={() => setModalOpen(false)} variant="secondary">Cancel</Button>
                            <Button type="submit" disabled={isLoading} icon={Plus} variant="primary">
                                {isLoading ? 'Saving...' : (currentDept ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// --- EMPLOYEE MANAGEMENT COMPONENT ---

const EmployeeManagement = ({ authState }) => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [unlinkedUsers, setUnlinkedUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'employee', department_id: '', joining_date: '', user_id: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const canManage = authState.role === 'admin' || authState.role === 'HR';

    const fetchDropdownData = async () => {
        setIsLoading(true);
        try {
            // Fetch Departments
            const deptResponse = await fetch(`${API_BASE_URL}/departments`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (deptResponse.ok) {
                const deptData = await deptResponse.json();
                setDepartments(deptData.data.departments || []);
            }

            // Fetch Unlinked Users (for linkage feature)
            if (canManage) {
                const usersResponse = await fetch(`${API_BASE_URL}/employees/unlinked-users`, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                });
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUnlinkedUsers(usersData.data.unlinkedUsers || []);
                }
            }
        } catch (error) {
            setMessage('Network error fetching dropdown data.');
        } finally {
             setIsLoading(false);
        }
    }

    const fetchEmployees = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            let url = `${API_BASE_URL}/employees?`;
            
            if (searchQuery) {
                url += `search=${encodeURIComponent(searchQuery)}&`;
            }
            if (filterDept) {
                url += `department_id=${encodeURIComponent(filterDept)}&`;
            }

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setEmployees(data.data.employees || []);
            } else {
                setMessage('Failed to fetch employees.');
            }
        } catch (error) {
            setMessage('Network error while fetching employees.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (authState.token) {
            fetchDropdownData();
            fetchEmployees();
        }
    }, [authState.token, searchQuery, filterDept]); // Re-fetch when search or filter changes

    const getDeptName = (deptId) => {
        return departments.find(d => d._id === deptId)?.name || 'N/A';
    };

    const openModal = (employee = null) => {
        setCurrentEmployee(employee);
        if (employee) {
            setFormData({
                name: employee.name,
                email: employee.email,
                role: employee.role,
                department_id: employee.department_id?._id || employee.department_id || '', // Handle nested object if populated
                joining_date: employee.joining_date ? new Date(employee.joining_date).toISOString().split('T')[0] : '',
                user_id: employee.user_id || '',
            });
        } else {
            setFormData({ name: '', email: '', role: 'employee', department_id: '', joining_date: '', user_id: '' });
        }
        setMessage('');
        setModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        const method = currentEmployee ? 'PUT' : 'POST';
        const endpoint = currentEmployee ? `/employees/${currentEmployee._id}` : '/employees';

        // Prepare data: remove user_id if it's an empty string (to avoid linking error)
        const dataToSend = { ...formData };
        if (dataToSend.user_id === '') {
            delete dataToSend.user_id;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                setMessage(`Employee ${currentEmployee ? 'updated' : 'added'} successfully!`);
                setModalOpen(false);
                fetchEmployees();
                fetchDropdownData(); // Refresh unlinked users list
            } else {
                const data = await response.json();
                setMessage(`Failed to save: ${data.message || (data.errors ? data.errors.join(', ') : 'Check network.')}`);
            }
        } catch (error) {
            setMessage('Network error during save operation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (empId) => {
        if (!window.confirm('Are you sure you want to delete this employee record?')) return;
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/employees/${empId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.ok) {
                setMessage('Employee deleted successfully!');
                fetchEmployees();
                fetchDropdownData(); // Refresh unlinked users list
            } else {
                const data = await response.json();
                setMessage(`Failed to delete: ${data.message || 'Check network.'}`);
            }
        } catch (error) {
            setMessage('Network error during delete operation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                    <Users size={28} />
                    <span>Employee Management</span>
                </h2>
                {canManage && (
                    <Button onClick={() => openModal()} icon={Plus} variant="primary">
                        Add New Employee
                    </Button>
                )}
            </div>

            {message && (
                <div className={`p-3 mb-4 text-sm font-medium ${message.startsWith('Error') || message.startsWith('Failed') ? 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300' : 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'} rounded-lg`}>
                    {message}
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Search by Name or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                <div className="relative">
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="appearance-none w-full sm:w-48 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                
                <Button onClick={() => { setSearchQuery(''); setFilterDept(''); }} variant="secondary">
                    Clear Filters
                </Button>
            </div>


            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-x-auto">
                {isLoading && (searchQuery || filterDept) ? (
                    <div className="p-10 text-center text-gray-500">Searching...</div>
                ) : isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading employees...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Auth Status</th>
                                {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {employees.length > 0 ? employees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{emp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{emp.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : emp.role === 'HR' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {getDeptName(emp.department_id?._id || emp.department_id)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(emp.joining_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {emp.user_id ? (
                                            <span className="flex items-center text-green-600 dark:text-green-400">
                                                <LinkIcon size={16} className="mr-1" /> Linked
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600 dark:text-red-400">
                                                <Slash size={16} className="mr-1" /> Unlinked
                                            </span>
                                        )}
                                    </td>
                                    {canManage && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button onClick={() => openModal(emp)} icon={Edit} variant="secondary">
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDelete(emp._id)} icon={X} variant="danger">
                                                Delete
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        No employees match your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {modalOpen && (
                <Modal title={currentEmployee ? 'Edit Employee' : 'Add New Employee'} onClose={() => setModalOpen(false)}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input id="name" type="text" name="name" required value={formData.name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input id="email" type="email" name="email" required value={formData.email} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                <select id="role" name="role" required value={formData.role} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                                    {EMPLOYEE_ROLES.map(r => (
                                        <option key={r} value={r}>{r.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                                <select id="department_id" name="department_id" required value={formData.department_id} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joining Date</label>
                                <input id="joining_date" type="date" name="joining_date" required value={formData.joining_date} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                            {/* User Linkage Field - only visible for managers */}
                            {canManage && (
                                <div>
                                    <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link User Account</label>
                                    <select id="user_id" name="user_id" value={formData.user_id} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                                        <option value="">{currentEmployee?.user_id ? 'Current User Linked' : 'Do Not Link (Default)'}</option>
                                        {unlinkedUsers.map(user => (
                                            <option key={user._id} value={user._id}>{user.email} (Role: {user.role})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Select an existing user login to link to this employee profile.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button onClick={() => setModalOpen(false)} variant="secondary">Cancel</Button>
                            <Button type="submit" disabled={isLoading} icon={Plus} variant="primary">
                                {isLoading ? 'Saving...' : (currentEmployee ? 'Update Employee' : 'Create Employee')}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// --- ADMIN TOOLS COMPONENT (User Creation) ---

const AdminTools = ({ authState }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ADMIN_CREATION_ROLES[0]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (authState.role !== 'admin') {
        return <div className="p-6 text-red-500">Access Denied: Only Admins can access these tools.</div>;
    }

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success! User ${email} created with role ${role.toUpperCase()}.`);
                setEmail('');
                setPassword('');
            } else {
                setMessage(`Error: ${data.message || 'Failed to create user.'}`);
            }
        } catch (error) {
            setMessage('Network error or server unreachable.');
            console.error('Admin Tools Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <Settings size={28} />
                <span>Admin Tools</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Use this module to securely create new **Admin** or **HR** users. Standard users must use the public registration page.
            </p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Management User</h3>
                {message && (
                    <div className={`p-3 mb-4 text-sm font-medium ${message.startsWith('Error') ? 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300' : 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'} rounded-lg`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            id="adminEmail"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            id="adminPassword"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="adminRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <select
                            id="adminRole"
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                            {ADMIN_CREATION_ROLES.map(r => (
                                <option key={r} value={r}>{r.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" disabled={isLoading} icon={Plus} variant="primary" className="w-full">
                        {isLoading ? 'Creating...' : `Create ${role.toUpperCase()} User`}
                    </Button>
                </form>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const App = () => {
    // page: 1=Employees, 2=Departments, 3=AdminTools
    const [page, setPage] = useState(1); 
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        token: null,
        user: null,
        role: null,
    });
    const [isAppLoading, setIsAppLoading] = useState(true);

    // Check for existing token on load (simple auto-login)
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (token) {
            // In a real app, you would validate this token against the server
            // For simplicity, we just assume it's valid and set a placeholder role
            setAuthState({ 
                isAuthenticated: true, 
                token: token, 
                user: { email: 'Loading...', role: 'employee' }, // Placeholder
                role: 'employee' 
            });
            // We set isAppLoading to false here, but the user state will be fixed after login
        }
        setIsAppLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setAuthState({ isAuthenticated: false, token: null, user: null, role: null });
        setPage(1); // Reset page to default view
    };

    if (isAppLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Loading Application...
            </div>
        );
    }

    if (!authState.isAuthenticated) {
        return <Auth setAuthState={setAuthState} />;
    }

    // Determine the component to render based on the current page state
    const renderPage = () => {
        switch (page) {
            case 1:
                return <EmployeeManagement authState={authState} />;
            case 2:
                return <DepartmentManagement authState={authState} />;
            case 3:
                return <AdminTools authState={authState} />;
            default:
                return <EmployeeManagement authState={authState} />;
        }
    };

    const navItems = [
        { id: 1, name: 'Employees', icon: Users, component: EmployeeManagement },
        { id: 2, name: 'Departments', icon: Building, component: DepartmentManagement },
    ];

    if (authState.role === 'admin') {
        navItems.push({ id: 3, name: 'Admin Tools', icon: Settings, component: AdminTools });
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            {/* Header / Navigation Bar */}
            <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">HRMS</span>
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

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mb-20 sm:mb-0">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;
