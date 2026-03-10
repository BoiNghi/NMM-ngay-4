const express = require('express');
const router = express.Router();
const Role = require('../schemas/Role');
const User = require('../schemas/User');

// GET all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
});

// GET role by ID
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error: error.message });
  }
});

// GET all users by role ID
router.get('/:id/users', async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    const users = await User.find({
      role: req.params.id,
      isDeleted: false
    }).populate('role');
    
    res.json({
      role: role,
      users: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users by role', error: error.message });
  }
});

// CREATE new role
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Role name is required' });
    }
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole && !existingRole.isDeleted) {
      return res.status(400).json({ message: 'Role name already exists' });
    }
    
    const newRole = new Role({
      name,
      description: description || ''
    });
    
    await newRole.save();
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error: error.message });
  }
});

// UPDATE role
router.put('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Update allowed fields
    if (req.body.name !== undefined) {
      role.name = req.body.name;
    }
    if (req.body.description !== undefined) {
      role.description = req.body.description;
    }
    
    await role.save();
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
});

// SOFT DELETE role
router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    role.isDeleted = true;
    await role.save();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting role', error: error.message });
  }
});

module.exports = router;
