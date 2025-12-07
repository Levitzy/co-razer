/**
 * Comments Widget for Documentation Pages
 * Usage: Include this script and add <div id="comments-section"></div> to your page
 */

class CommentsWidget {
  constructor(containerId, pageUrl) {
    this.container = document.getElementById(containerId);
    this.pageUrl = pageUrl;
    this.currentUser = null;
    this.comments = [];
    
    if (!this.container) {
      console.error(`Comments container "${containerId}" not found`);
      return;
    }
    
    this.init();
  }

  async init() {
    await this.checkAuth();
    await this.loadComments();
    this.render();
  }

  async checkAuth() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        this.currentUser = data.user;
      }
    } catch (error) {
      console.log('User not logged in');
    }
  }

  async loadComments() {
    try {
      const response = await fetch(`/api/comments?pageUrl=${encodeURIComponent(this.pageUrl)}`);
      const data = await response.json();
      if (data.success) {
        this.comments = data.comments;
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="comments-widget">
        <style>
          .comments-widget {
            margin: 3rem 0;
            padding: 2rem;
            background: rgba(17, 21, 26, 0.5);
            border: 1px solid rgba(30, 38, 48, 1);
            border-radius: 12px;
          }
          .comments-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(30, 38, 48, 1);
          }
          .comments-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #fff;
          }
          .comments-count {
            color: #6ee7ff;
            font-weight: 600;
          }
          .comment-form {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: rgba(11, 13, 16, 0.8);
            border-radius: 8px;
            border: 1px solid rgba(30, 38, 48, 1);
          }
          .comment-textarea {
            width: 100%;
            min-height: 100px;
            padding: 1rem;
            background: rgba(17, 21, 26, 1);
            border: 1px solid rgba(30, 38, 48, 1);
            border-radius: 6px;
            color: #fff;
            font-size: 0.95rem;
            font-family: inherit;
            resize: vertical;
          }
          .comment-textarea:focus {
            outline: none;
            border-color: #6ee7ff;
          }
          .comment-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
          }
          .char-count {
            color: #9ca3af;
            font-size: 0.875rem;
          }
          .btn-submit {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #6ee7ff 0%, #64f5a1 100%);
            color: #0b0d10;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .btn-submit:hover {
            transform: translateY(-2px);
          }
          .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .login-prompt {
            padding: 1.5rem;
            background: rgba(11, 13, 16, 0.8);
            border-radius: 8px;
            border: 1px solid rgba(30, 38, 48, 1);
            text-align: center;
            margin-bottom: 2rem;
          }
          .login-prompt a {
            color: #6ee7ff;
            text-decoration: none;
            font-weight: 600;
          }
          .login-prompt a:hover {
            text-decoration: underline;
          }
          .comments-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .comment-item {
            padding: 1.5rem;
            background: rgba(11, 13, 16, 0.6);
            border-radius: 8px;
            border: 1px solid rgba(30, 38, 48, 1);
          }
          .comment-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6ee7ff 0%, #64f5a1 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #0b0d10;
          }
          .comment-avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }
          .comment-info {
            flex: 1;
          }
          .comment-author {
            font-weight: 600;
            color: #fff;
          }
          .comment-date {
            font-size: 0.875rem;
            color: #9ca3af;
          }
          .comment-content {
            color: #d1d5db;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .comment-footer {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(30, 38, 48, 1);
          }
          .comment-action {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid rgba(30, 38, 48, 1);
            border-radius: 6px;
            color: #9ca3af;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          .comment-action:hover {
            border-color: #6ee7ff;
            color: #6ee7ff;
          }
          .comment-action.liked {
            color: #6ee7ff;
            border-color: #6ee7ff;
          }
          .no-comments {
            text-align: center;
            padding: 3rem 1rem;
            color: #9ca3af;
          }
          .error-message {
            padding: 1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 6px;
            color: #fca5a5;
            margin-bottom: 1rem;
          }
        </style>

        <div class="comments-header">
          <h3 class="comments-title">💬 Comments</h3>
          <span class="comments-count">${this.comments.length} ${this.comments.length === 1 ? 'comment' : 'comments'}</span>
        </div>

        ${this.renderCommentForm()}
        
        <div class="comments-list">
          ${this.comments.length === 0 ? this.renderNoComments() : this.comments.map(c => this.renderComment(c)).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderCommentForm() {
    if (!this.currentUser) {
      return `
        <div class="login-prompt">
          <p>Please <a href="/login.html">login</a> or <a href="/register.html">create an account</a> to leave a comment.</p>
        </div>
      `;
    }

    return `
      <div class="comment-form">
        <textarea 
          id="comment-input" 
          class="comment-textarea" 
          placeholder="Share your thoughts or ask a question..."
          maxlength="2000"
        ></textarea>
        <div class="comment-actions">
          <span class="char-count"><span id="char-count">0</span> / 2000</span>
          <button id="submit-comment" class="btn-submit">Post Comment</button>
        </div>
        <div id="comment-error"></div>
      </div>
    `;
  }

  renderComment(comment) {
    const isOwner = this.currentUser && this.currentUser.id === comment.userId.toString();
    const isLiked = this.currentUser && comment.likes.some(id => id.toString() === this.currentUser.id.toString());
    const replyCount = comment.replies ? comment.replies.length : 0;
    
    return `
      <div class="comment-item" data-comment-id="${comment._id}">
        <div class="comment-header">
          <div class="comment-avatar">
            ${comment.userProfilePicture 
              ? `<img src="${comment.userProfilePicture}" alt="${comment.username}">` 
              : comment.username.charAt(0).toUpperCase()
            }
          </div>
          <div class="comment-info">
            <div class="comment-author">${comment.username}</div>
            <div class="comment-date">${this.formatDate(comment.createdAt)}</div>
          </div>
        </div>
        <div class="comment-content">${this.escapeHtml(comment.content)}</div>
        <div class="comment-footer">
          ${this.currentUser ? `
            <button class="comment-action ${isLiked ? 'liked' : ''}" data-action="like" data-comment-id="${comment._id}">
              <span>❤️</span>
              <span>${comment.likes.length}</span>
            </button>
            <button class="comment-action" data-action="reply" data-comment-id="${comment._id}">
              <span>💬</span>
              <span>Reply</span>
            </button>
          ` : `
            <span class="comment-action">
              <span>❤️</span>
              <span>${comment.likes.length}</span>
            </span>
          `}
          ${isOwner ? `
            <button class="comment-action" data-action="delete" data-comment-id="${comment._id}">
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          ` : ''}
        </div>
        
        <!-- Reply Form (Hidden by default) -->
        <div class="reply-form" id="reply-form-${comment._id}" style="display: none;">
          <textarea 
            class="comment-textarea" 
            id="reply-input-${comment._id}" 
            placeholder="Write a reply..."
            maxlength="1000"
            style="min-height: 80px; margin-top: 1rem;"
          ></textarea>
          <div class="comment-actions" style="margin-top: 0.5rem;">
            <span class="char-count"><span id="reply-char-count-${comment._id}">0</span> / 1000</span>
            <div>
              <button class="btn-submit" data-action="submit-reply" data-comment-id="${comment._id}">Post Reply</button>
              <button class="btn-submit" style="background: #6b7280; margin-left: 0.5rem;" data-action="cancel-reply" data-comment-id="${comment._id}">Cancel</button>
            </div>
          </div>
          <div id="reply-error-${comment._id}"></div>
        </div>

        <!-- Replies -->
        ${replyCount > 0 ? `
          <div class="replies-container" style="margin-top: 1rem; padding-left: 3rem; border-left: 2px solid rgba(30, 38, 48, 1);">
            ${comment.replies.map(reply => this.renderReply(reply)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderReply(reply) {
    return `
      <div class="reply-item" style="padding: 1rem; margin-bottom: 0.75rem; background: rgba(11, 13, 16, 0.4); border-radius: 6px;">
        <div class="comment-header" style="margin-bottom: 0.5rem;">
          <div class="comment-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">
            ${reply.userProfilePicture 
              ? `<img src="${reply.userProfilePicture}" alt="${reply.username}">` 
              : reply.username.charAt(0).toUpperCase()
            }
          </div>
          <div class="comment-info">
            <div class="comment-author" style="font-size: 0.875rem;">${reply.username}</div>
            <div class="comment-date" style="font-size: 0.75rem;">${this.formatDate(reply.createdAt)}</div>
          </div>
        </div>
        <div class="comment-content" style="font-size: 0.9rem;">${this.escapeHtml(reply.content)}</div>
      </div>
    `;
  }

  renderNoComments() {
    return `
      <div class="no-comments">
        <p>No comments yet. Be the first to share your thoughts! 💭</p>
      </div>
    `;
  }

  attachEventListeners() {
    // Character counter
    const textarea = document.getElementById('comment-input');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        document.getElementById('char-count').textContent = e.target.value.length;
      });
    }

    // Submit comment
    const submitBtn = document.getElementById('submit-comment');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitComment());
    }

    // Like buttons
    document.querySelectorAll('[data-action="like"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.currentTarget.dataset.commentId;
        this.toggleLike(commentId);
      });
    });

    // Delete buttons
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.currentTarget.dataset.commentId;
        if (confirm('Are you sure you want to delete this comment?')) {
          this.deleteComment(commentId);
        }
      });
    });

    // Reply buttons
    document.querySelectorAll('[data-action="reply"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.currentTarget.dataset.commentId;
        this.showReplyForm(commentId);
      });
    });

    // Submit reply buttons
    document.querySelectorAll('[data-action="submit-reply"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.currentTarget.dataset.commentId;
        this.submitReply(commentId);
      });
    });

    // Cancel reply buttons
    document.querySelectorAll('[data-action="cancel-reply"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.currentTarget.dataset.commentId;
        this.hideReplyForm(commentId);
      });
    });

    // Reply character counters
    document.querySelectorAll('[id^="reply-input-"]').forEach(textarea => {
      const commentId = textarea.id.replace('reply-input-', '');
      textarea.addEventListener('input', (e) => {
        const counter = document.getElementById(`reply-char-count-${commentId}`);
        if (counter) {
          counter.textContent = e.target.value.length;
        }
      });
    });
  }

  showReplyForm(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
      replyForm.style.display = 'block';
      const input = document.getElementById(`reply-input-${commentId}`);
      if (input) {
        input.focus();
      }
    }
  }

  hideReplyForm(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    const input = document.getElementById(`reply-input-${commentId}`);
    const errorDiv = document.getElementById(`reply-error-${commentId}`);
    
    if (replyForm) replyForm.style.display = 'none';
    if (input) input.value = '';
    if (errorDiv) errorDiv.innerHTML = '';
  }

  async submitReply(commentId) {
    const textarea = document.getElementById(`reply-input-${commentId}`);
    const errorDiv = document.getElementById(`reply-error-${commentId}`);
    const content = textarea.value.trim();

    errorDiv.innerHTML = '';

    if (!content) {
      errorDiv.innerHTML = '<div class="error-message">Reply cannot be empty</div>';
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      const data = await response.json();

      if (data.success) {
        this.hideReplyForm(commentId);
        await this.loadComments();
        this.render();
      } else {
        errorDiv.innerHTML = `<div class="error-message">${data.error}</div>`;
      }
    } catch (error) {
      errorDiv.innerHTML = '<div class="error-message">Failed to post reply. Please try again.</div>';
    }
  }

  async submitComment() {
    const textarea = document.getElementById('comment-input');
    const errorDiv = document.getElementById('comment-error');
    const content = textarea.value.trim();

    errorDiv.innerHTML = '';

    if (!content) {
      errorDiv.innerHTML = '<div class="error-message">Comment cannot be empty</div>';
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageUrl: this.pageUrl, content })
      });

      const data = await response.json();

      if (data.success) {
        textarea.value = '';
        document.getElementById('char-count').textContent = '0';
        await this.loadComments();
        this.render();
      } else {
        errorDiv.innerHTML = `<div class="error-message">${data.error}</div>`;
      }
    } catch (error) {
      errorDiv.innerHTML = '<div class="error-message">Failed to post comment. Please try again.</div>';
    }
  }

  async toggleLike(commentId) {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        await this.loadComments();
        this.render();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  async deleteComment(commentId) {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await this.loadComments();
        this.render();
      } else {
        alert('Failed to delete comment: ' + data.error);
      }
    } catch (error) {
      alert('Failed to delete comment. Please try again.');
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Auto-initialize if comments-section exists
document.addEventListener('DOMContentLoaded', () => {
  const commentsSection = document.getElementById('comments-section');
  if (commentsSection) {
    const pageUrl = window.location.pathname;
    new CommentsWidget('comments-section', pageUrl);
  }
});

