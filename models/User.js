const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

class User {
  constructor(db) {
    this.collection = db.collection('users');
  }

  /**
   * Create a new user
   */
  async create({ username, email, password, fullName }) {
    try {
      // Hash password with improved security (12 rounds)
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName: fullName || '',
        profilePicture: null,
        bio: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null
      };

      const result = await this.collection.insertOne(user);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return { ...userWithoutPassword, _id: result.insertedId };
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await this.collection.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by username
   */
  async findByUsername(username) {
    return await this.collection.findOne({ username: username.toLowerCase() });
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId) {
    await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );
  }

  /**
   * Get user by email or username (for login)
   */
  async findByEmailOrUsername(identifier) {
    return await this.collection.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const allowedUpdates = ['fullName', 'email', 'username', 'bio'];
    const updateData = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
        if (key === 'email' || key === 'username') {
          updateData[key] = updateData[key].toLowerCase();
        }
      }
    }

    updateData.updatedAt = new Date();

    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (result.value) {
        const { password: _, ...userWithoutPassword } = result.value;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await this.verifyPassword(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Use improved security (12 rounds)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    return true;
  }

  /**
   * Update profile picture
   */
  async updateProfilePicture(userId, filename) {
    console.log('updateProfilePicture called with userId:', userId);
    
    // Get current user to delete old profile picture
    const user = await this.findById(userId);
    if (!user) {
      console.error('User not found in updateProfilePicture:', userId);
      return null;
    }
    
    if (user.profilePicture) {
      // Delete old profile picture
      const oldPath = path.join(__dirname, '..', 'public', user.profilePicture);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error('Error deleting old profile picture:', err);
        }
      }
    }

    // Update with new profile picture path
    const profilePicturePath = `/uploads/profiles/${filename}`;
    
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          profilePicture: profilePicturePath,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    console.log('findOneAndUpdate result:', result);

    // Handle both old and new MongoDB driver response formats
    const updatedUser = result.value || result;
    
    if (updatedUser && updatedUser._id) {
      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    }
    
    console.error('No user returned from findOneAndUpdate');
    return null;
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(userId) {
    console.log('deleteProfilePicture called with userId:', userId);
    
    const user = await this.findById(userId);
    if (!user) {
      console.error('User not found in deleteProfilePicture:', userId);
      return null;
    }

    console.log('User found, current profilePicture:', user.profilePicture);

    // Delete file if exists
    if (user.profilePicture) {
      const filePath = path.join(__dirname, '..', 'public', user.profilePicture);
      console.log('Attempting to delete file:', filePath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('File deleted successfully');
        } catch (err) {
          console.error('Error deleting profile picture file:', err);
        }
      } else {
        console.log('File does not exist on disk');
      }
    } else {
      console.log('User has no profile picture set, will still update to null');
    }

    // Update database - always update even if user has no profile picture
    // This ensures the field is set to null
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          profilePicture: null,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    console.log('findOneAndUpdate result in deleteProfilePicture:', result);

    // Handle both old and new MongoDB driver response formats
    const updatedUser = result.value || result;
    
    if (updatedUser && updatedUser._id) {
      const { password: _, ...userWithoutPassword } = updatedUser;
      console.log('Profile picture deleted successfully');
      return userWithoutPassword;
    }
    
    console.error('No user returned from findOneAndUpdate in deleteProfilePicture');
    return null;
  }

  /**
   * Delete user
   */
  async delete(userId) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount > 0;
  }
}

module.exports = User;

