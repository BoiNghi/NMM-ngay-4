const express = require('express');
const router = express.Router();
const User = require('../schemas/User');

// GET all users with optional username search
router.get('/', async (req, res) => {
  try {
    const { username } = req.query;
    let query = { isDeleted: false };
    
    // If username is provided, search with includes (case-insensitive)
    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }
    
    const users = await User.find(query).populate('role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// CREATE new user
router.post('/', async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;
    
    // Validation
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    const newUser = new User({
      username,
      password,
      email,
      fullName: fullName || '',
      avatarUrl: avatarUrl || 'https://i.sstatic.net/l60Hf.png',
      role
    });
    
    await newUser.save();
    const savedUser = await newUser.populate('role');
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// UPDATE user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update allowed fields
    const allowedFields = ['username', 'password', 'email', 'fullName', 'avatarUrl', 'status', 'role', 'loginCount'];
    const updates = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    Object.assign(user, updates);
    await user.save();
    const updatedUser = await User.findById(user._id).populate('role');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// SOFT DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isDeleted = true;
    await user.save();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// ENABLE user (set status to true)
router.post('/enable', async (req, res) => {
  try {
    const { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).json({ message: 'Email and username are required' });
    }
    
    const user = await User.findOne({
      email,
      username,
      isDeleted: false
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with provided email and username' });
    }
    
    user.status = true;
    await user.save();
    const updatedUser = await User.findById(user._id).populate('role');
    res.json({ 
      message: 'User enabled successfully', 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error enabling user', error: error.message });
  }
});

// DISABLE user (set status to false)
router.post('/disable', async (req, res) => {
  try {
    const { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).json({ message: 'Email and username are required' });
    }
    
    const user = await User.findOne({
      email,
      username,
      isDeleted: false
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with provided email and username' });
    }
    
    user.status = false;
    await user.save();
    const updatedUser = await User.findById(user._id).populate('role');
    res.json({ 
      message: 'User disabled successfully', 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error disabling user', error: error.message });
  }
});

module.exports = router;
