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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [isTestDisqualified, setIsTestDisqualified] = useState(false);
  const [copyAttempts, setCopyAttempts] = useState(0);

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
      timeSpent: 1800 - timeLeft,
      tabSwitchCount,
      copyAttempts,
      disqualified: isTestDisqualified
    };

    updateApplicantTest(currentApplicant.id, testData);
    navigate('/feedback');
  }, [answers, timeLeft, currentApplicant, updateApplicantTest, navigate, tabSwitchCount, isTestDisqualified, copyAttempts]);

  // Copy/Paste/Right-click Protection
  useEffect(() => {
    // Prevent copy
    const handleCopy = (e) => {
      e.preventDefault();
      setCopyAttempts(prev => prev + 1);
      alert('⚠️ WARNING: Copying content is not allowed during the test!');
      return false;
    };

    // Prevent cut
    const handleCut = (e) => {
      e.preventDefault();
      setCopyAttempts(prev => prev + 1);
      alert('⚠️ WARNING: Cutting content is not allowed during the test!');
      return false;
    };

    // Prevent paste
    const handlePaste = (e) => {
      e.preventDefault();
      alert('⚠️ WARNING: Pasting content is not allowed during the test!');
      return false;
    };

    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert('⚠️ WARNING: Right-click is disabled during the test!');
      return false;
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      // Block Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A, Ctrl+U
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          setCopyAttempts(prev => prev + 1);
          alert('⚠️ WARNING: Copying (Ctrl+C) is not allowed!');
          return false;
        }
        if (e.key === 'x' || e.key === 'X') {
          e.preventDefault();
          setCopyAttempts(prev => prev + 1);
          alert('⚠️ WARNING: Cutting (Ctrl+X) is not allowed!');
          return false;
        }
        if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          alert('⚠️ WARNING: Pasting (Ctrl+V) is not allowed!');
          return false;
        }
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          alert('⚠️ WARNING: Select All (Ctrl+A) is not allowed!');
          return false;
        }
        if (e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          alert('⚠️ WARNING: View Source (Ctrl+U) is not allowed!');
          return false;
        }
      }
      
      // Block F12 and DevTools shortcuts
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        alert('⚠️ WARNING: Developer tools are not allowed during the test!');
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Disable text selection via CSS
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    return () => {
      // Remove event listeners on cleanup
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);

      // Re-enable text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, []);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          
          if (newCount === 1) {
            setShowTabWarning(true);
            setTimeout(() => setShowTabWarning(false), 5000);
          } else if (newCount === 2) {
            setShowTabWarning(true);
            setTimeout(() => setShowTabWarning(false), 5000);
          } else if (newCount >= 3) {
            setIsTestDisqualified(true);
            setShowTabWarning(true);
            setTimeout(() => {
              handleSubmit();
            }, 3000);
          }
          
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleSubmit]);

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

  // Disqualification Modal
  if (isTestDisqualified) {
    return (
      <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center animate-fade-in">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Disqualified</h2>
          <p className="text-gray-600 mb-4">
            You have switched tabs/windows <strong>{tabSwitchCount} times</strong>. 
            The test has been automatically submitted.
          </p>
          <p className="text-sm text-red-600 font-medium">
            Your test will be marked as invalid due to violation of test rules.
          </p>
        </div>
      </div>
    );
  }

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
              <div className="text-center">
                <p className="text-sm text-gray-600">Tab Switches</p>
                <p className={`text-lg font-bold ${
                  tabSwitchCount === 0 ? 'text-green-600' : 
                  tabSwitchCount === 1 ? 'text-yellow-600' : 
                  tabSwitchCount === 2 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {tabSwitchCount}/3
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Copy Attempts</p>
                <p className="text-lg font-bold text-red-600">
                  {copyAttempts}
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

      {/* Time Warning Banner */}
      {showWarning && (
        <div className="bg-yellow-500 text-white px-4 py-3 text-center font-medium animate-pulse">
          ⚠️ Only 5 minutes remaining!
        </div>
      )}

      {/* Tab Switch Warning Banner */}
      {showTabWarning && !isTestDisqualified && (
        <div className={`${
          tabSwitchCount === 1 ? 'bg-yellow-500' : 
          tabSwitchCount === 2 ? 'bg-orange-500' : 'bg-red-600'
        } text-white px-4 py-3 text-center font-bold animate-pulse`}>
          {tabSwitchCount === 1 && '⚠️ Warning: Do not switch tabs! (1st Warning)'}
          {tabSwitchCount === 2 && '⚠️ FINAL WARNING: One more tab switch will disqualify your test! (2nd Warning)'}
          {tabSwitchCount >= 3 && '❌ TEST DISQUALIFIED: Too many tab switches detected!'}
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

            {/* Warning Notice */}
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm text-red-800 font-bold mb-2">
                    🔒 IMPORTANT: Test Security Policies
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li><strong>Tab Switching:</strong> Maximum 3 violations allowed. Current: <strong className="text-red-900">{tabSwitchCount}/3</strong></li>
                    <li><strong>Copy/Cut/Paste:</strong> Completely disabled. Copy attempts: <strong className="text-red-900">{copyAttempts}</strong></li>
                    <li><strong>Right-Click:</strong> Context menu is blocked</li>
                    <li><strong>Text Selection:</strong> Disabled to prevent copying</li>
                    <li><strong>Keyboard Shortcuts:</strong> Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A, F12 blocked</li>
                    <li><strong>Developer Tools:</strong> Access is restricted</li>
                  </ul>
                  <p className="text-sm text-red-800 font-semibold mt-2">
                    ⚠️ Violation of these rules may result in automatic disqualification!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;