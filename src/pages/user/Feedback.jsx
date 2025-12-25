import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { submitFeedback } from '../../api';

const Feedback = () => {
  const navigate = useNavigate();
  const { currentApplicant } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState({
    testDifficulty: '',
    platformExperience: '',
    improvements: '',
    wouldRecommend: '',
    comments: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Map feedback data to the expected backend format
    const feedbackData = {
      rating: rating,  // Backend expects 'rating' as integer
      problem1: feedback.testDifficulty || '',  // Send as string
      problem2: feedback.platformExperience || '',  // Send as string
      problem3: feedback.improvements || '',  // Send as string
      problem4: feedback.wouldRecommend || '',  // Send as string
      problem5: feedback.comments || '',  // Send as string
      name: currentApplicant?.fullName || '',  // Include applicant's name
      email: currentApplicant?.email || '',  // Include applicant's email
      position: currentApplicant?.position || '',  // Include position applied for
      submittedAt: new Date().toISOString()  // Include timestamp
    };
    
    setSubmitting(true);
    
    try {
      await submitFeedback(feedbackData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
{/* Floating Background Blobs */}
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-lg text-gray-600">Your application has been submitted successfully.</p>
          </div>

          <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900">What happens next?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Our team will review your application and test results
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You'll receive an email within 3-5 business days
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Shortlisted candidates will be contacted for the next round
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tight">
            We'd Love Your Feedback!
          </h1>
          <p className="text-lg text-gray-600 font-medium">Help us improve your experience</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
          <div className="space-y-10">
            <div className="text-center pb-8 border-b-2 border-gray-100">
              <label className="block text-xl font-bold text-gray-800 mb-6 tracking-tight">
                How would you rate your overall experience?
              </label>
              <div className="flex justify-center space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transform transition-all hover:scale-125 active:scale-110"
                  >
                    <svg
                      className={`w-14 h-14 transition-all ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current drop-shadow-lg'
                          : 'text-gray-300'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-base font-semibold text-gray-700 mt-4">
                {rating === 0 && '⭐ Click to rate'}
                {rating === 1 && '⭐ Poor'}
                {rating === 2 && '⭐⭐ Fair'}
                {rating === 3 && '⭐⭐⭐ Good'}
                {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
              </p>
            </div>



            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4 tracking-tight">
                How would you rate the difficulty of the test?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFeedback(prev => ({ ...prev, testDifficulty: level }))}
                    className={`px-5 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                      feedback.testDifficulty === level
                        ? 'border-blue-600 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                        : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md bg-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4 tracking-tight">
                How was your experience with our test platform?
              </label>
              <div className="space-y-3">
                {['Excellent - Very smooth', 'Good - Minor issues', 'Average - Some problems', 'Poor - Many issues'].map((exp) => (
                  <label key={exp} className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 hover:border-blue-300 group">
                    <input
                      type="radio"
                      name="platformExperience"
                      value={exp}
                      checked={feedback.platformExperience === exp}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-4 text-gray-700 font-medium group-hover:text-blue-700">{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4 tracking-tight">
                Would you recommend our company to others?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['Yes', 'Maybe', 'No'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFeedback(prev => ({ ...prev, wouldRecommend: option }))}
                    className={`px-6 py-4 rounded-xl border-2 font-bold transition-all text-base ${
                      feedback.wouldRecommend === option
                        ? option === 'Yes'
                          ? 'border-green-600 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                          : option === 'Maybe'
                          ? 'border-yellow-600 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                          : 'border-red-600 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-md bg-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-800 mb-3 tracking-tight">
                What could we improve?
              </label>
              <textarea
                name="improvements"
                value={feedback.improvements}
                onChange={handleChange}
                rows={4}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 font-medium placeholder-gray-400 shadow-sm"
                placeholder="Share your suggestions..."
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-800 mb-3 tracking-tight">
                Any additional comments?
              </label>
              <textarea
                name="comments"
                value={feedback.comments}
                onChange={handleChange}
                rows={5}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 font-medium placeholder-gray-400 shadow-sm"
                placeholder="Tell us more about your experience..."
              />
            </div>



            <div className="pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              {rating === 0 && (
                <p className="text-sm text-red-500 text-center mt-3 font-medium">⚠️ Please provide an overall rating</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;