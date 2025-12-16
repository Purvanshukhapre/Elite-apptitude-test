import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { sampleQuestions } from '../data/questions';

const AptitudeTest = () => {
  const navigate = useNavigate();
  const { currentApplicant, updateApplicantTest } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = useCallback(() => {
    let score = 0;
    sampleQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const testData = {
      answers,
      score,
      totalQuestions: sampleQuestions.length,
      percentage: ((score / sampleQuestions.length) * 100).toFixed(2),
      timeSpent: 1800 - timeLeft
    };

    updateApplicantTest(currentApplicant.id, testData);
    navigate('/feedback');
  }, [answers, timeLeft, currentApplicant, updateApplicantTest, navigate]);

  useEffect(() => {
    if (!currentApplicant) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        if (prev === 300) { // 5 minutes warning
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentApplicant, navigate, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / sampleQuestions.length) * 100;

  if (!currentApplicant) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aptitude Test</h1>
              <p className="text-sm text-gray-600">Welcome, {currentApplicant.fullName}</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-bold text-blue-600">{answeredCount}/{sampleQuestions.length}</p>
              </div>
              <div className={`text-center px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
              }`}>
                <p className="text-sm text-gray-600">Time Left</p>
                <p className={`text-xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {showWarning && (
        <div className="bg-yellow-500 text-white px-4 py-3 text-center font-medium animate-pulse">
          ⚠️ Only 5 minutes remaining!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h3 className="font-bold text-gray-900 mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      currentQuestion === idx
                        ? 'bg-blue-600 text-white'
                        : answers[q.id] !== undefined
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  <span className="text-gray-600">Current</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Display */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {sampleQuestions[currentQuestion].category}
                  </span>
                  <span className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {sampleQuestions.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sampleQuestions[currentQuestion].question}
                </h2>
              </div>

              <div className="space-y-4">
                {sampleQuestions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(sampleQuestions[currentQuestion].id, idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition transform hover:scale-102 ${
                      answers[sampleQuestions[currentQuestion].id] === idx
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                        answers[sampleQuestions[currentQuestion].id] === idx
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {answers[sampleQuestions[currentQuestion].id] === idx && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-lg ${
                        answers[sampleQuestions[currentQuestion].id] === idx
                          ? 'font-semibold text-blue-900'
                          : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                
                {currentQuestion < sampleQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.min(sampleQuestions.length - 1, prev + 1))}
                    className="px-6 py-3 gradient-primary rounded-lg font-medium text-white hover:shadow-lg transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-green-600 rounded-lg font-medium text-white hover:bg-green-700 hover:shadow-lg transition"
                  >
                    Submit Test
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> You can navigate between questions using the question navigator or Previous/Next buttons. 
                Make sure to answer all questions before submitting!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
