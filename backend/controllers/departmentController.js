const Department = require('../models/Department');

// Helper to handle Mongoose validation and other errors
const handleError = (res, error, defaultMessage = 'Operation failed.') => {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate department name.' });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation failed.', errors: messages });
    }
    console.error("Controller Error:", error);
    res.status(500).json({ message: defaultMessage });
};

// ----------------------------------------------------------------------
// 1. Get All Departments (GET /api/departments)
// ----------------------------------------------------------------------
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.status(200).json(departments);
    } catch (error) {
        handleError(res, error, 'Failed to retrieve departments.');
    }
};

// ----------------------------------------------------------------------
// 2. Create Department (POST /api/departments)
// ----------------------------------------------------------------------
const createDepartment = async (req, res) => {
    try {
        const newDepartment = await Department.create(req.body);
        res.status(201).json(newDepartment);
    } catch (error) {
        handleError(res, error, 'Failed to create department.');
    }
};

// ----------------------------------------------------------------------
// 3. Update Department (PUT /api/departments/:id)
// ----------------------------------------------------------------------
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedDepartment = await Department.findByIdAndUpdate(id, req.body, {
            new: true, // Return the updated document
            runValidators: true // Run schema validation on update
        });

        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        res.status(200).json(updatedDepartment);
    } catch (error) {
        handleError(res, error, 'Failed to update department.');
    }
};

// ----------------------------------------------------------------------
// 4. Delete Department (DELETE /api/departments/:id)
// ----------------------------------------------------------------------
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDepartment = await Department.findByIdAndDelete(id);

        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        // Note: In a real app, you must handle cascade deleting employees or setting their department_id to null
        res.status(204).json(null); // 204 No Content for successful deletion
    } catch (error) {
        handleError(res, error, 'Failed to delete department.');
    }
};

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
