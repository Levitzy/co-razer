const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { getDatabase } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/notifications
 * Get user's notifications
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    const db = getDatabase();
    const notificationModel = new Notification(db);

    const notifications = await notificationModel.getByUser(
      req.session.userId,
      {
        limit: parseInt(limit),
        skip: parseInt(skip),
        unreadOnly: unreadOnly === 'true'
      }
    );

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications'
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const notificationModel = new Notification(db);

    const count = await notificationModel.getUnreadCount(req.session.userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const notificationModel = new Notification(db);

    const notification = await notificationModel.markAsRead(
      req.params.id,
      req.session.userId
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.put('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const notificationModel = new Notification(db);

    const count = await notificationModel.markAllAsRead(req.session.userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const notificationModel = new Notification(db);

    const deleted = await notificationModel.delete(
      req.params.id,
      req.session.userId
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

/**
 * DELETE /api/notifications
 * Delete all notifications for the user
 */
router.delete('/', requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const notificationModel = new Notification(db);

    const count = await notificationModel.deleteAll(req.session.userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notifications'
    });
  }
});

module.exports = router;


