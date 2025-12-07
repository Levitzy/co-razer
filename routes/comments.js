const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { getDatabase } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/comments
 * Create a new comment
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { pageUrl, content } = req.body;

    if (!pageUrl || !content) {
      return res.status(400).json({
        success: false,
        error: 'Page URL and content are required'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment cannot be empty'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Comment is too long (max 2000 characters)'
      });
    }

    const db = getDatabase();
    const commentModel = new Comment(db);

    // Get user info from session
    const User = require('../models/User');
    const userModel = new User(db);
    const user = await userModel.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const comment = await commentModel.create({
      userId: req.session.userId,
      username: user.username,
      userProfilePicture: user.profilePicture || null,
      pageUrl,
      content: content.trim()
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create comment'
    });
  }
});

/**
 * GET /api/comments
 * Get comments for a page
 */
router.get('/', async (req, res) => {
  try {
    const { pageUrl, limit = 50, skip = 0 } = req.query;

    if (!pageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Page URL is required'
      });
    }

    const db = getDatabase();
    const commentModel = new Comment(db);

    const comments = await commentModel.getByPage(pageUrl, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    const count = await commentModel.countByPage(pageUrl);

    res.json({
      success: true,
      comments,
      count
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get comments'
    });
  }
});

/**
 * PUT /api/comments/:id
 * Update a comment
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Comment is too long (max 2000 characters)'
      });
    }

    const db = getDatabase();
    const commentModel = new Comment(db);

    const comment = await commentModel.update(
      req.params.id,
      req.session.userId,
      content.trim()
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found or you do not have permission to edit it'
      });
    }

    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update comment'
    });
  }
});

/**
 * DELETE /api/comments/:id
 * Delete a comment
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const commentModel = new Comment(db);

    const deleted = await commentModel.delete(req.params.id, req.session.userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment'
    });
  }
});

/**
 * POST /api/comments/:id/reply
 * Add a reply to a comment
 */
router.post('/:id/reply', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Reply content is required'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Reply is too long (max 1000 characters)'
      });
    }

    const db = getDatabase();
    const commentModel = new Comment(db);

    console.log('Reply request - Comment ID:', req.params.id);

    // Get the original comment first (to notify the author)
    const originalComment = await commentModel.findById(req.params.id);
    
    console.log('Original comment found:', originalComment ? 'Yes' : 'No');
    
    if (!originalComment) {
      console.error('Comment not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Get user info
    const User = require('../models/User');
    const userModel = new User(db);
    const user = await userModel.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const comment = await commentModel.addReply(req.params.id, {
      userId: req.session.userId,
      username: user.username,
      userProfilePicture: user.profilePicture || null,
      content: content.trim()
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Create notification for the original comment author (if not replying to self)
    if (originalComment.userId.toString() !== req.session.userId) {
      const Notification = require('../models/Notification');
      const notificationModel = new Notification(db);
      
      await notificationModel.create({
        userId: originalComment.userId,
        type: 'comment_reply',
        message: `${user.username} replied to your comment: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        data: {
          commentId: req.params.id,
          replyUserId: req.session.userId,
          replyUsername: user.username,
          pageUrl: originalComment.pageUrl
        }
      });
    }

    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add reply'
    });
  }
});

/**
 * POST /api/comments/:id/like
 * Like/unlike a comment
 */
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const commentModel = new Comment(db);

    const result = await commentModel.toggleLike(req.params.id, req.session.userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    res.json({
      success: true,
      liked: result.liked
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle like'
    });
  }
});

/**
 * GET /api/comments/user/:userId
 * Get user's comments
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const db = getDatabase();
    const commentModel = new Comment(db);

    const comments = await commentModel.getByUser(req.params.userId, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get comments'
    });
  }
});

/**
 * GET /api/comments/recent
 * Get recent comments across all pages
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const db = getDatabase();
    const commentModel = new Comment(db);

    const comments = await commentModel.getRecent(parseInt(limit));

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Get recent comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent comments'
    });
  }
});

module.exports = router;

