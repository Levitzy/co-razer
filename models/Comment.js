const { ObjectId } = require('mongodb');

class Comment {
  constructor(db) {
    this.collection = db.collection('comments');
  }

  /**
   * Create a new comment
   */
  async create({ userId, username, userProfilePicture, pageUrl, content }) {
    const comment = {
      userId: new ObjectId(userId),
      username,
      userProfilePicture: userProfilePicture || null,
      pageUrl,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: [],
      replies: []
    };

    const result = await this.collection.insertOne(comment);
    return { ...comment, _id: result.insertedId };
  }

  /**
   * Get comments for a specific page
   */
  async getByPage(pageUrl, options = {}) {
    const { limit = 50, skip = 0, sortBy = 'createdAt', sortOrder = -1 } = options;

    const comments = await this.collection
      .find({ pageUrl })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    return comments;
  }

  /**
   * Get comment by ID
   */
  async findById(commentId) {
    try {
      return await this.collection.findOne({ _id: new ObjectId(commentId) });
    } catch (error) {
      return null;
    }
  }

  /**
   * Update comment content
   */
  async update(commentId, userId, content) {
    const result = await this.collection.findOneAndUpdate(
      { 
        _id: new ObjectId(commentId),
        userId: new ObjectId(userId) // Only owner can update
      },
      { 
        $set: { 
          content,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    // Handle both old and new MongoDB driver response formats
    return result.value || result;
  }

  /**
   * Delete comment
   */
  async delete(commentId, userId) {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(commentId),
      userId: new ObjectId(userId) // Only owner can delete
    });

    return result.deletedCount > 0;
  }

  /**
   * Add reply to a comment
   */
  async addReply(commentId, { userId, username, userProfilePicture, content }) {
    const reply = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      username,
      userProfilePicture: userProfilePicture || null,
      content,
      createdAt: new Date()
    };

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(commentId) },
      { 
        $push: { replies: reply },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    // Handle both old and new MongoDB driver response formats
    return result.value || result;
  }

  /**
   * Like/unlike a comment
   */
  async toggleLike(commentId, userId) {
    const comment = await this.findById(commentId);
    if (!comment) return null;

    const userIdStr = userId.toString();
    const isLiked = comment.likes.some(id => id.toString() === userIdStr);

    if (isLiked) {
      // Unlike
      await this.collection.updateOne(
        { _id: new ObjectId(commentId) },
        { $pull: { likes: new ObjectId(userId) } }
      );
      return { liked: false };
    } else {
      // Like
      await this.collection.updateOne(
        { _id: new ObjectId(commentId) },
        { $push: { likes: new ObjectId(userId) } }
      );
      return { liked: true };
    }
  }

  /**
   * Get user's comments
   */
  async getByUser(userId, options = {}) {
    const { limit = 50, skip = 0 } = options;

    const comments = await this.collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return comments;
  }

  /**
   * Count comments for a page
   */
  async countByPage(pageUrl) {
    return await this.collection.countDocuments({ pageUrl });
  }

  /**
   * Get recent comments across all pages
   */
  async getRecent(limit = 10) {
    return await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = Comment;

