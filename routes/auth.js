const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getDatabase } = require('../config/database');
const upload = require('../config/upload');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Username, email, and password are required' 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        error: 'Username must be at least 3 characters long' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    const db = getDatabase();
    const userModel = new User(db);

    // Create user
    const user = await userModel.create({ username, email, password, fullName });

    // Create session
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.email = user.email;

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Registration failed' 
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email/username and password are required' 
      });
    }

    const db = getDatabase();
    const userModel = new User(db);

    // Find user by email or username
    const user = await userModel.findByEmailOrUsername(identifier);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Verify password
    const isValid = await userModel.verifyPassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    await userModel.updateLastLogin(user._id);

    // Create session
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.email = user.email;

    res.json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: 'Logout failed' 
      });
    }
    res.clearCookie('connect.sid');
    res.json({ 
      success: true,
      message: 'Logout successful' 
    });
  });
});

/**
 * POST /api/auth/upload-profile-picture
 * Upload profile picture
 */
router.post('/upload-profile-picture', requireAuth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('Upload request - User ID:', req.session.userId);
    console.log('Uploaded file:', req.file.filename);

    const db = getDatabase();
    const userModel = new User(db);

    const user = await userModel.updateProfilePicture(req.session.userId, req.file.filename);

    if (!user) {
      console.error('User not found for ID:', req.session.userId);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('Profile picture updated successfully for user:', user.username);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload profile picture'
    });
  }
});

/**
 * DELETE /api/auth/profile-picture
 * Delete profile picture
 */
router.delete('/profile-picture', requireAuth, async (req, res) => {
  try {
    console.log('Delete request - User ID:', req.session.userId);
    
    const db = getDatabase();
    const userModel = new User(db);

    const user = await userModel.deleteProfilePicture(req.session.userId);

    if (!user) {
      console.error('User not found for ID in delete:', req.session.userId);
      return res.status(404).json({
        success: false,
        error: 'User not found or no profile picture to delete'
      });
    }

    console.log('Profile picture deleted successfully for user:', user.username);

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete profile picture'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated' 
      });
    }

    const db = getDatabase();
    const userModel = new User(db);
    const user = await userModel.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user information' 
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {

    const db = getDatabase();
    const userModel = new User(db);
    
    const user = await userModel.updateProfile(req.session.userId, req.body);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Update session if email or username changed
    if (req.body.username) req.session.username = user.username;
    if (req.body.email) req.session.email = user.email;

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to update profile' 
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'New password must be at least 6 characters long' 
      });
    }

    const db = getDatabase();
    const userModel = new User(db);
    
    await userModel.changePassword(req.session.userId, currentPassword, newPassword);

    res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to change password' 
    });
  }
});

module.exports = router;

