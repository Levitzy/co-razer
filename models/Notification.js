const { ObjectId } = require('mongodb');

class Notification {
  constructor(db) {
    this.collection = db.collection('notifications');
  }

  /**
   * Create a new notification
   */
  async create({ userId, type, message, data }) {
    try {
      const notification = {
        userId: new ObjectId(userId),
        type, // 'comment_reply', 'comment_like', etc.
        message,
        data, // Additional data (commentId, pageUrl, etc.)
        read: false,
        createdAt: new Date()
      };

      const result = await this.collection.insertOne(notification);
      return { ...notification, _id: result.insertedId };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  async getByUser(userId, { limit = 20, skip = 0, unreadOnly = false } = {}) {
    try {
      const query = { userId: new ObjectId(userId) };
      if (unreadOnly) {
        query.read = false;
      }

      const notifications = await this.collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return notifications;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId) {
    try {
      return await this.collection.countDocuments({
        userId: new ObjectId(userId),
        read: false
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { 
          _id: new ObjectId(notificationId),
          userId: new ObjectId(userId)
        },
        { $set: { read: true } },
        { returnDocument: 'after' }
      );

      return result.value || result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const result = await this.collection.updateMany(
        { 
          userId: new ObjectId(userId),
          read: false
        },
        { $set: { read: true } }
      );

      return result.modifiedCount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async delete(notificationId, userId) {
    try {
      const result = await this.collection.deleteOne({
        _id: new ObjectId(notificationId),
        userId: new ObjectId(userId)
      });

      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAll(userId) {
    try {
      const result = await this.collection.deleteMany({
        userId: new ObjectId(userId)
      });

      return result.deletedCount;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Notification;


