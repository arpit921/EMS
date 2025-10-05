// --- CONFIGURATION ---
// IMPORTANT: The frontend prefers REACT_APP_API_BASE_URL from the environment (set by Vercel/Render at build time).
// Fall back to localhost for local development.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
export const EMPLOYEE_ROLES = ['employee', 'HR', 'admin']; // Available roles for assignment
export const ADMIN_CREATION_ROLES = ['HR', 'admin']; // Roles an admin can create

// Utility function to format date
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
