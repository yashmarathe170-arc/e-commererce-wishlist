import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { MOCK_USER_ID } from '../context/OrderContext';
import {
  fetchProductReviews,
  addReview,
  editReview,
  deleteReview
} from '../services/reviewApi';
import '../styles/ReviewModal.css';

/**
 * ReviewModal component to manage product reviews and ratings
 * @param {Object} props
 * @param {Object} props.product - The active product { id, name, price }
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onRatingUpdate - Callback to update parent state with new average rating/count
 */
const ReviewModal = ({ product, onClose, onRatingUpdate }) => {
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form states
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Edit state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  // Error state for validation
  const [formError, setFormError] = useState('');
  const [editFormError, setEditFormError] = useState('');

  // Fetch reviews when modal opens
  useEffect(() => {
    let active = true;

    fetchProductReviews(product.name)
      .then((data) => {
        if (active) {
          setReviews(data.reviews || []);
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.totalReviews || 0);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews');
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [product.name]);

  // Helper to render star elements
  const renderStars = (ratingVal, interactive = false, onSelect = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star-icon ${i <= ratingVal ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={interactive && onSelect ? () => onSelect(i) : undefined}
        >
          ★
        </span>
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  // Add review form submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validations
    const trimmedName = userName.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName) {
      setFormError('Name is required');
      return;
    }
    if (trimmedName.length < 2) {
      setFormError('Name must be at least 2 characters long');
      return;
    }
    if (trimmedName.length > 50) {
      setFormError('Name cannot exceed 50 characters');
      return;
    }

    if (rating < 1 || rating > 5) {
      setFormError('Rating must be between 1 and 5 stars');
      return;
    }

    if (!trimmedComment) {
      setFormError('Comment is required');
      return;
    }
    if (trimmedComment.length < 3) {
      setFormError('Comment must be at least 3 characters long');
      return;
    }
    if (trimmedComment.length > 1000) {
      setFormError('Comment cannot exceed 1000 characters');
      return;
    }

    setSubmitting(true);
    try {
      await addReview({
        productName: product.name,
        userId: MOCK_USER_ID,
        userName: trimmedName,
        rating,
        comment: trimmedComment
      });

      toast.success('Review added successfully!');
      
      // Reset form
      setUserName('');
      setRating(5);
      setComment('');
      
      // Reload reviews and update parent
      const updatedData = await fetchProductReviews(product.name);
      setReviews(updatedData.reviews || []);
      setAverageRating(updatedData.averageRating || 0);
      setTotalReviews(updatedData.totalReviews || 0);
      
      // Propagate to main feed
      if (onRatingUpdate) {
        onRatingUpdate(product.name, updatedData.averageRating, updatedData.totalReviews);
      }
    } catch (error) {
      console.error('Error adding review:', error);
      const errMsg = error.response?.data?.message || 'Failed to submit review';
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Initialize edit mode for a review
  const startEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditFormError('');
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditFormError('');
  };

  // Save edited review
  const handleSaveEdit = async (e, reviewId) => {
    e.preventDefault();
    setEditFormError('');

    const trimmedComment = editComment.trim();

    // Client-side validations
    if (editRating < 1 || editRating > 5) {
      setEditFormError('Rating must be between 1 and 5 stars');
      return;
    }

    if (!trimmedComment) {
      setEditFormError('Comment is required');
      return;
    }
    if (trimmedComment.length < 3) {
      setEditFormError('Comment must be at least 3 characters long');
      return;
    }
    if (trimmedComment.length > 1000) {
      setEditFormError('Comment cannot exceed 1000 characters');
      return;
    }

    setSubmitting(true);
    try {
      await editReview(reviewId, {
        userId: MOCK_USER_ID,
        rating: editRating,
        comment: trimmedComment
      });

      toast.success('Review updated successfully!');
      setEditingReviewId(null);

      // Reload reviews and update parent
      const updatedData = await fetchProductReviews(product.name);
      setReviews(updatedData.reviews || []);
      setAverageRating(updatedData.averageRating || 0);
      setTotalReviews(updatedData.totalReviews || 0);

      // Propagate to main feed
      if (onRatingUpdate) {
        onRatingUpdate(product.name, updatedData.averageRating, updatedData.totalReviews);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      const errMsg = error.response?.data?.message || 'Failed to update review';
      setEditFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review submission
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await deleteReview(reviewId, MOCK_USER_ID);
      toast.success('Review deleted successfully!');

      // Reload reviews and update parent
      const updatedData = await fetchProductReviews(product.name);
      setReviews(updatedData.reviews || []);
      setAverageRating(updatedData.averageRating || 0);
      setTotalReviews(updatedData.totalReviews || 0);

      // Propagate to main feed
      if (onRatingUpdate) {
        onRatingUpdate(product.name, updatedData.averageRating, updatedData.totalReviews);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      const errMsg = error.response?.data?.message || 'Failed to delete review';
      toast.error(errMsg);
    }
  };

  // Check if the current user has already reviewed the product
  const userHasReviewed = reviews.some((r) => r.userId === MOCK_USER_ID);

  return createPortal(
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <header className="review-modal-header">
          <div>
            <h2>Reviews & Ratings</h2>
            <p className="modal-subtitle">{product.name}</p>
          </div>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </header>

        {/* Modal Body */}
        <div className="review-modal-body">
          {loading ? (
            <div className="modal-loader">
              <span className="spinner"></span> Loading reviews...
            </div>
          ) : (
            <div className="reviews-layout">
              {/* Left Column: Reviews List */}
              <div className="reviews-list-section">
                <h3>Customer Reviews ({totalReviews})</h3>
                
                {reviews.length === 0 ? (
                  <div className="no-reviews-state">
                    <p>No reviews yet for this product. Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div className="reviews-scroll-container">
                    {reviews.map((rev) => {
                      const isOwner = rev.userId === MOCK_USER_ID;
                      const isEditing = editingReviewId === rev._id;

                      return (
                        <div key={rev._id} className={`review-card ${isOwner ? 'owner-card' : ''}`}>
                          <div className="review-card-header">
                            <div>
                              <span className="reviewer-name">{rev.userName}</span>
                              {isOwner && <span className="you-badge">You</span>}
                            </div>
                            <span className="review-date">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          {isEditing ? (
                            /* Inline Edit Form */
                            <form onSubmit={(e) => handleSaveEdit(e, rev._id)} className="inline-edit-form">
                              <div className="form-group">
                                <label>Your Rating:</label>
                                {renderStars(editRating, true, setEditRating)}
                              </div>
                              <div className="form-group">
                                <label htmlFor={`edit-comment-${rev._id}`}>Your Review:</label>
                                <textarea
                                  id={`edit-comment-${rev._id}`}
                                  value={editComment}
                                  onChange={(e) => setEditComment(e.target.value)}
                                  rows={3}
                                  placeholder="What do you think about the product?"
                                ></textarea>
                              </div>
                              {editFormError && <p className="error-message">{editFormError}</p>}
                              <div className="edit-actions">
                                <button type="submit" className="save-btn" disabled={submitting}>
                                  {submitting ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" className="cancel-btn" onClick={cancelEdit} disabled={submitting}>
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            /* Read Only Review view */
                            <>
                              {renderStars(rev.rating)}
                              <p className="review-comment">{rev.comment}</p>
                              
                              {isOwner && (
                                <div className="review-actions">
                                  <button className="action-link edit-link" onClick={() => startEdit(rev)}>
                                    Edit
                                  </button>
                                  <button className="action-link delete-link" onClick={() => handleDeleteReview(rev._id)}>
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Add Review Form or Rating Breakdown */}
              <div className="review-form-section">
                {/* Dynamic Rating Summary card */}
                <div className="rating-summary-card">
                  <h4>Overall Rating</h4>
                  <div className="summary-rating-number">
                    {averageRating.toFixed(1)}
                  </div>
                  {renderStars(Math.round(averageRating))}
                  <p className="summary-text">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                {/* Form to submit review */}
                {!editingReviewId && (
                  userHasReviewed ? (
                    <div className="reviewed-notice">
                      <p>You have already reviewed this product.</p>
                      <p className="notice-sub">You can modify or remove your existing review in the review list.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="add-review-form">
                      <h4>Write a Review</h4>
                      
                      <div className="form-group">
                        <label htmlFor="user-name">Your Name</label>
                        <input
                          id="user-name"
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Rating</label>
                        {renderStars(rating, true, setRating)}
                      </div>

                      <div className="form-group">
                        <label htmlFor="review-comment">Review Comment</label>
                        <textarea
                          id="review-comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Describe your experience with this product..."
                          rows={4}
                          required
                        ></textarea>
                      </div>

                      {formError && <p className="error-message">{formError}</p>}

                      <button type="submit" className="submit-review-btn" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReviewModal;
