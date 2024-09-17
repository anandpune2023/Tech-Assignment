import React from 'react';
import './Review.css'; 

const Review = ({ reviews, responses, isLoggedIn, handleChange, handleRespond, renderStars }) => {
  return (
    <div className="review-cards">
      {reviews.map(review => (
        <div key={review.reviewId} className="review-card">
          <div className="review-header">
            <img src={review.reviewer.profilePhotoUrl} alt="Profile" className="profile-photo" />
            <div className="reviewer-info">
              <p className="reviewer-name">{review.reviewer.displayName}</p>
              <p className="review-date">{new Date(review.createTime).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="review-content">
            <p>{review.comment}</p>
            <div className="review-rating">
              {renderStars(review.starRating)}<span>{` ${review.starRating}/5`}</span>
            </div>
          </div>
          <div className="response-section">
            {review.response ? (
              <p><strong>Response:</strong> {review.response.comment}</p>
            ) : (
              isLoggedIn && (
                <>
                  <textarea
                    value={responses[review.reviewId] || ""}
                    onChange={(e) => handleChange(review.reviewId, e)}
                    placeholder="Add a response"
                    rows="4"
                    spellCheck={false}
                  />
                  <button onClick={() => handleRespond(review.reviewId)}>
                    Respond
                  </button>
                </>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Review;
