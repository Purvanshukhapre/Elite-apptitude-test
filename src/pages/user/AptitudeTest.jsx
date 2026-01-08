import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { sampleQuestions } from '../../data/questions';
import { submitTest, sendTestSubmissionEmail } from '../../api';
import { submitTestQuestions } from '../../services/apiService';

const AptitudeTest = () => {
  const navigate = useNavigate();
  const { currentApplicant, updateApplicantTest, testQuestions } = useApp();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showWarning, setShowWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [isTestDisqualified, setIsTestDisqualified] = useState(false);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    // Set submitting state to prevent multiple clicks
    setIsSubmitting(true);
    
    // Get user identity information (email and fullName) from multiple sources
    // This follows the approach requested by the user to store and retrieve identity info
    let userEmail = null;
    let userFullName = null;
    
    // First, try to get from sessionStorage (where it should be stored after registration)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedIdentity = sessionStorage.getItem('userIdentity');
      if (storedIdentity) {
        try {
          const identity = JSON.parse(storedIdentity);
          userEmail = identity.email;
          userFullName = identity.fullName;
        } catch (e) {
          console.error('Failed to parse stored user identity:', e);
        }
      }
    }
    
    // If not found in sessionStorage, try to get from localStorage
    if (!userEmail && !userFullName && typeof window !== 'undefined' && window.localStorage) {
      const storedIdentity = localStorage.getItem('userIdentity');
      if (storedIdentity) {
        try {
          const identity = JSON.parse(storedIdentity);
          userEmail = identity.email;
          userFullName = identity.fullName;
        } catch (e) {
          console.error('Failed to parse stored user identity from localStorage:', e);
        }
      }
    }
    
    // If still not found, try to get from the currentApplicant context as fallback
    if (!userEmail && !userFullName) {
      let applicantToUse = currentApplicant;
      
      if (Array.isArray(currentApplicant)) {
        // Check if the array contains question objects instead of applicant objects
        const firstElement = currentApplicant[0];
        if (firstElement && firstElement.question !== undefined && firstElement.options !== undefined) {
          // This array contains question objects, not applicant objects
          // This indicates a bug where questions were mistakenly assigned to currentApplicant
          console.error('BUG DETECTED: currentApplicant contains question objects instead of applicant objects');
          
          // Try to get the correct applicant from localStorage or sessionStorage
          if (typeof window !== 'undefined' && window.sessionStorage) {
            const storedApplicant = sessionStorage.getItem('currentApplicant');
            if (storedApplicant) {
              try {
                applicantToUse = JSON.parse(storedApplicant);
              } catch (e) {
                console.error('Failed to parse stored applicant data:', e);
              }
            }
          }
          
          // If we still don't have a valid applicant, try to find in the array
          // by looking for objects that have applicant-like properties
          if (!applicantToUse || (applicantToUse.email === undefined && applicantToUse.fullName === undefined)) {
            const actualApplicant = currentApplicant.find(item => 
              item && (item.email !== undefined || item.fullName !== undefined || item.personalEmail !== undefined)
            );
            if (actualApplicant) {
              applicantToUse = actualApplicant;
            }
          }
        } else {
          // If the array contains applicant objects, find the most recently registered applicant
          const recentApplicant = currentApplicant.find(applicant => {
            return !applicant.testData || !applicant.testData.score;
          });
          
          if (recentApplicant) {
            applicantToUse = recentApplicant;
          } else {
            applicantToUse = currentApplicant[currentApplicant.length - 1];
          }
        }
      }
      
      // Extract email and fullName from the applicant object
      if (applicantToUse && applicantToUse.email) {
        userEmail = applicantToUse.email;
      } else if (applicantToUse && applicantToUse.permanentEmail) {
        userEmail = applicantToUse.permanentEmail;
      }
      
      if (applicantToUse && applicantToUse.fullName) {
        userFullName = applicantToUse.fullName;
      }
    }
    
    // Validate that we have the required identity information
    if (!userEmail || !userFullName) {
      console.error('Missing required user identity information (email or fullName):', { 
        userEmail, 
        userFullName,
        currentApplicant
      });
      alert('Error: Unable to submit test. Missing required user information. Please restart the test or contact support.');
      setIsSubmitting(false);
      return;
    }
    
    // Create applicantToUse object with the identity information
    const applicantToUse = {
      id: 'current_user', // Placeholder ID
      email: userEmail,
      fullName: userFullName,
      permanentEmail: userEmail
    };
    
    let score = 0;
    const questionsToUse = questions.length > 0 ? questions : sampleQuestions;
    const detailedAnswers = {};
    
    // Prepare data for the new API
    const questionsForSubmission = [];
    
    questionsToUse.forEach(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) {
        score++;
      }
      
      // Store detailed answer information
      detailedAnswers[q.id] = {
        selectedOption: userAnswer,
        correctOption: q.correctAnswer,
        isCorrect: isCorrect,
        optionText: userAnswer !== undefined ? q.options[userAnswer] : 'Not answered',
        correctOptionText: q.options[q.correctAnswer]
      };
      
      // Prepare data for the new API submission
      questionsForSubmission.push({
        questionId: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        correctOptionText: q.options[q.correctAnswer],
        userSelectedOption: userAnswer,
        userSelectedOptionText: userAnswer !== undefined ? q.options[userAnswer] : null,
        isCorrect: isCorrect,
        category: q.category,
        difficulty: q.difficulty
      });
    });

    const percentage = (score / questionsToUse.length) * 100;
    const passFailStatus = percentage >= 60 ? 'Pass' : 'Fail'; // 60% to pass
    
    // Prepare the base test data first
    const testData = {
      answers,
      questions: questionsToUse,
      detailedAnswers,
      score,
      totalQuestions: questionsToUse.length,
      correctAnswers: score,
      percentage: percentage.toFixed(2),
      passFailStatus,
      timeSpent: 900 - timeLeft, // Updated for 15 minutes
      tabSwitchCount,
      copyAttempts,
      disqualified: isTestDisqualified,
      applicantId: applicantToUse.id || 'unknown',
      applicantName: applicantToUse.fullName || 'Unknown Applicant',
      email: applicantToUse.permanentEmail || applicantToUse.email || 'unknown@example.com'
    };
    
    // Prepare data for the new API submission in the required format
    // Ensure we have fallbacks to prevent undefined values
    const email = applicantToUse.permanentEmail || applicantToUse.email || testData.email || 'unknown@example.com';
    const fullName = applicantToUse.fullName || testData.applicantName || 'Unknown Applicant';
    
    // Validate that email and fullName are present before submission
    if (!email || !fullName || email === 'unknown@example.com' || fullName === 'Unknown Applicant') {
      console.error('Missing required email or fullName for test submission:', { 
        email, 
        fullName, 
        currentApplicant, 
        testData 
      });
      alert('Error: Unable to submit test. Missing required user information. Please contact support.');
      return; // Prevent submission if critical data is missing
    }
    
    const testQuestionsData = {
      email: email,
      fullName: fullName,
      questions: questionsForSubmission.map(q => ({
        aiQuestion: q.question,
        Options: q.options,
        aiAnswer: q.options[q.correctAnswer],
        userAnswer: q.userSelectedOption !== undefined ? q.options[q.userSelectedOption] : '',
        // Include additional information about the question
        questionId: q.questionId || q.id,
        correctOptionIndex: q.correctAnswer,
        userSelectedOptionIndex: q.userSelectedOption,
        isCorrect: q.correctAnswer === q.userSelectedOption
      }))
    };
    
    // Debug logging to verify the data being sent
    console.log('Submitting test questions with data:', {
      email,
      fullName,
      questionCount: testQuestionsData.questions.length,
      sampleQuestion: testQuestionsData.questions[0] // Log first question as sample
    });
    
    // console.log('Test Results:', testData);

    try {
      // Submit test questions data to the new API
      await submitTestQuestions(testQuestionsData);
      // console.log('Test questions submission result:', questionsResult);
      
      // Submit test data to the original API
      const result = await submitTest(testData);
      // console.log('Test submission result:', result);
      
      // Update applicant with test data
      updateApplicantTest(applicantToUse.id, {
        ...testData,
        score: result.score || `${score}/${questionsToUse.length}`,
        result: result,
        // Ensure correctAnswers is included even if API submission fails later
        correctAnswers: result.correctAnswers
      });
      
      // Send email notification about test submission
      try {
        const emailForNotification = applicantToUse.permanentEmail || applicantToUse.email || testData.email;
        const nameForNotification = applicantToUse.fullName || testData.applicantName;
        
        // Validate that we have required data for email notification
        if (!emailForNotification || !nameForNotification) {
          console.error('Missing required data for email notification:', { 
            email: emailForNotification, 
            name: nameForNotification 
          });
        } else {
          const emailData = {
            email: emailForNotification,
            name: nameForNotification
          };
          await sendTestSubmissionEmail(emailData);
          console.log('Email notification sent successfully to:', emailForNotification);
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the entire submission if email fails
      }
      
      // Only navigate to feedback if submission was successful
      navigate('/feedback');
    } catch (error) {
      console.error('Error submitting test:', error);
      
      // Update applicant with local test data including the calculated correct answers
      // The testData object already contains correctAnswers: score from line 51
      updateApplicantTest(applicantToUse.id, {
        ...testData,
        // Use the correctAnswers that was already calculated in the testData object
        correctAnswers: testData.correctAnswers,
        email: applicantToUse.permanentEmail || applicantToUse.email
      });
      
      // Send email notification about test submission even if API submission failed
      try {
        const emailForNotification = applicantToUse.permanentEmail || applicantToUse.email || testData.email;
        const nameForNotification = applicantToUse.fullName || testData.applicantName;
        
        // Validate that we have required data for email notification
        if (!emailForNotification || !nameForNotification) {
          console.error('Missing required data for email notification (in error flow):', { 
            email: emailForNotification, 
            name: nameForNotification 
          });
        } else {
          const emailData = {
            email: emailForNotification,
            name: nameForNotification
          };
          await sendTestSubmissionEmail(emailData);
          console.log('Email notification sent successfully (in error flow) to:', emailForNotification);
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the submission flow if email fails
      }
      
      // Show error message to user
      if (window.confirm('Test submission failed due to a network error. Your test has been saved locally. Would you like to continue to the feedback page?')) {
        navigate('/feedback');
      }
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  }, [answers, timeLeft, currentApplicant, updateApplicantTest, navigate, tabSwitchCount, isTestDisqualified, copyAttempts, questions]);

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

  // Use questions from context or fallback to sample questions
  useEffect(() => {
    setLoading(true);
    try {
      // console.log('testQuestions from context:', testQuestions);
      if (testQuestions && testQuestions.length > 0) {
        // console.log('Using dynamic questions from API');
        // Transform API questions to match expected format
        const transformedQuestions = testQuestions.map((q, index) => ({
          // Use the original question ID if available, otherwise generate one
          id: q.id || index + 1,
          question: q.question,
          options: q.options,
          // Convert letter answer (A,B,C,D) to index (0,1,2,3)
          // Handle the format where correctAnswer is a letter (A,B,C,D)
          correctAnswer: (() => {
            // Log the question structure for debugging
            // console.log('Processing question:', q);
            // console.log('Options:', q.options);
            // console.log('Correct answer:', q.correctAnswer);
            
            // Handle when correctAnswer is already a number (from mock data)
            if (typeof q.correctAnswer === 'number') {
              // console.log('Correct answer is already a number:', q.correctAnswer);
              return q.correctAnswer;
            }
            
            // If correctAnswer is a single letter (A,B,C,D) from real API
            if (q.correctAnswer && typeof q.correctAnswer === 'string' && q.correctAnswer.length === 1) {
              const letterIndex = q.correctAnswer.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
              // console.log('Letter answer:', q.correctAnswer, 'Index:', letterIndex, 'Options length:', q.options.length);
              const result = letterIndex >= 0 && letterIndex < q.options.length ? letterIndex : 0;
              // console.log('Final index:', result);
              return result;
            }
            
            // Fallback: try to find in options
            const index = q.options.findIndex(opt => 
              opt.startsWith(q.correctAnswer + '.') || 
              opt.startsWith(q.correctAnswer + ')') ||
              opt.startsWith(q.correctAnswer + ' ')
            );
            
            // console.log('Fallback index:', index);
            return index >= 0 ? index : 0;
          })(),
          category: q.category || q.type || 'General',
          difficulty: q.difficulty || 'Medium'
        }));
        
        // console.log('Transformed questions:', transformedQuestions);
        setQuestions(transformedQuestions);
      } else {
        // console.log('No dynamic questions available, using sample questions');
        // Fallback to sample questions
        setQuestions(sampleQuestions);
      }
    } catch (err) {
      console.error('Failed to process questions:', err);
      // Fallback to sample questions
      setQuestions(sampleQuestions);
    } finally {
      setLoading(false);
    }
  }, [testQuestions]);

  useEffect(() => {
    // Check if user identity information is available
    // First check sessionStorage
    let hasIdentity = false;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedIdentity = sessionStorage.getItem('userIdentity');
      if (storedIdentity) {
        try {
          const identity = JSON.parse(storedIdentity);
          if (identity.email && identity.fullName) {
            hasIdentity = true;
          }
        } catch (e) {
          console.error('Failed to parse stored user identity:', e);
        }
      }
    }
    
    // If not in sessionStorage, check localStorage
    if (!hasIdentity && typeof window !== 'undefined' && window.localStorage) {
      const storedIdentity = localStorage.getItem('userIdentity');
      if (storedIdentity) {
        try {
          const identity = JSON.parse(storedIdentity);
          if (identity.email && identity.fullName) {
            hasIdentity = true;
          }
        } catch (e) {
          console.error('Failed to parse stored user identity from localStorage:', e);
        }
      }
    }
    
    // If we don't have identity info, check currentApplicant as fallback
    if (!hasIdentity) {
      if (!currentApplicant) {
        navigate('/');
        return;
      }
      
      // Check if currentApplicant has the required identity information
      if (Array.isArray(currentApplicant)) {
        // If it's an array, check if it contains applicant objects
        const firstElement = currentApplicant[0];
        if (firstElement && firstElement.question === undefined) {
          // Likely applicant objects, check for identity
          const validApplicant = currentApplicant.find(app => app.email && app.fullName);
          if (!validApplicant) {
            console.error('No valid applicant with identity found in currentApplicant array');
            navigate('/');
            return;
          }
        } else if (firstElement && firstElement.question !== undefined) {
          // This is question data, not applicant data
          console.error('currentApplicant contains question data instead of applicant data');
          navigate('/');
          return;
        }
      } else {
        // Single applicant object
        if (!(currentApplicant.email && currentApplicant.fullName) && 
            !(currentApplicant.permanentEmail && currentApplicant.fullName)) {
          console.error('currentApplicant does not contain required identity information');
          navigate('/');
          return;
        }
      }
    }
    
    // If user has already submitted the test, redirect to feedback
    if (currentApplicant && currentApplicant.testData && currentApplicant.testData.score) {
      navigate('/feedback');
      return;
    }

    // Prevent user from navigating back to test after submission
    const handlePopState = () => {
      // Prevent back navigation during test
      window.history.pushState(null, null, window.location.pathname);
    };

    // Add the event listener
    window.addEventListener('popstate', handlePopState);
    
    // Push initial state to prevent back navigation
    window.history.pushState(null, null, window.location.pathname);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        if (prev === 300) { // 5 minutes warning (300 seconds = 5 minutes)
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('popstate', handlePopState);
    };
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

  const questionsToUse = questions.length > 0 ? questions : sampleQuestions;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questionsToUse.length) * 100;

  // Check if user identity information is available before rendering
  let hasIdentity = false;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const storedIdentity = sessionStorage.getItem('userIdentity');
    if (storedIdentity) {
      try {
        const identity = JSON.parse(storedIdentity);
        if (identity.email && identity.fullName) {
          hasIdentity = true;
        }
      } catch (e) {
        console.error('Failed to parse stored user identity:', e);
      }
    }
  }
  
  // If not in sessionStorage, check localStorage
  if (!hasIdentity && typeof window !== 'undefined' && window.localStorage) {
    const storedIdentity = localStorage.getItem('userIdentity');
    if (storedIdentity) {
      try {
        const identity = JSON.parse(storedIdentity);
        if (identity.email && identity.fullName) {
          hasIdentity = true;
        }
      } catch (e) {
        console.error('Failed to parse stored user identity from localStorage:', e);
      }
    }
  }
  
  // If we still don't have identity info, check currentApplicant as fallback
  if (!hasIdentity) {
    if (!currentApplicant) {
      return null; // This will cause a redirect handled by the useEffect
    }
    
    if (Array.isArray(currentApplicant)) {
      // Check if it contains applicant objects with identity
      const firstElement = currentApplicant[0];
      if (firstElement && firstElement.question !== undefined) {
        // This is question data, not applicant data
        return null; // This will cause a redirect handled by the useEffect
      }
      
      const validApplicant = currentApplicant.some(app => app.email && app.fullName);
      if (!validApplicant) {
        return null; // This will cause a redirect handled by the useEffect
      }
    } else {
      // Single applicant object
      if (!(currentApplicant.email && currentApplicant.fullName) && 
          !(currentApplicant.permanentEmail && currentApplicant.fullName)) {
        return null; // This will cause a redirect handled by the useEffect
      }
    }
  }
  
  if (currentApplicant && (currentApplicant.testData && currentApplicant.testData.score)) {
    return null;
  }

  // Show loading state while fetching questions
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Questions...</h2>
          <p className="text-gray-600">Preparing your aptitude test</p>
        </div>
      </div>
    );
  }



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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Aptitude Test</h1>
              <p className="text-sm text-gray-600">Welcome, {currentApplicant.fullName}</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="text-center">
                <p className="text-xs md:text-sm text-gray-600">Progress</p>
                <p className="text-sm md:text-lg font-bold text-blue-600">{answeredCount}/{questionsToUse.length}</p>
              </div>
              <div className={`text-center px-3 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <p className="text-xs md:text-sm text-gray-600">Time Left</p>
                <p className={`text-sm md:text-xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs md:text-sm text-gray-600">Tab Switches</p>
                <p className={`text-sm md:text-lg font-bold ${
                  tabSwitchCount === 0 ? 'text-green-600' : 
                  tabSwitchCount === 1 ? 'text-yellow-600' : 
                  tabSwitchCount === 2 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {tabSwitchCount}/3
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs md:text-sm text-gray-600">Copy Attempts</p>
                <p className="text-sm md:text-lg font-bold text-red-600">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
          {/* Question Navigation for larger screens */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h3 className="font-bold text-gray-900 mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {questionsToUse.map((q, idx) => (
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

          {/* Question Navigation for small screens */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-1">
                {questionsToUse.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-8 h-8 rounded text-xs font-medium transition ${
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
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  <span className="text-gray-600">Current</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Display */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {questionsToUse[currentQuestion]?.category || 'General'}
                  {questionsToUse[currentQuestion]?.difficulty && (
                    <span className="ml-1 px-1 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                      {questionsToUse[currentQuestion].difficulty}
                    </span>
                  )}
                </span>
                <span className="text-xs sm:text-sm text-gray-600">
                  Question {currentQuestion + 1} of {questionsToUse.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {questionsToUse[currentQuestion]?.question || 'Loading question...'}
              </h2>
            </div>

            <div className="space-y-3">
              {questionsToUse[currentQuestion]?.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(questionsToUse[currentQuestion].id, idx)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    answers[questionsToUse[currentQuestion].id] === idx
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      answers[questionsToUse[currentQuestion].id] === idx
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {answers[questionsToUse[currentQuestion].id] === idx && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base ${
                      answers[questionsToUse[currentQuestion].id] === idx
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              {currentQuestion < questionsToUse.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(questionsToUse.length - 1, prev + 1))}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 rounded-lg font-medium text-white hover:bg-blue-700 hover:shadow-lg transition"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 bg-green-600 rounded-lg font-medium text-white hover:bg-green-700 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Test'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-xs sm:text-sm text-red-800 font-bold mb-1">
                  🔒 IMPORTANT: Test Security Policies
                </p>
                <ul className="text-xs sm:text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li><strong>Tab Switching:</strong> Maximum 3 violations allowed. Current: <strong className="text-red-900">{tabSwitchCount}/3</strong></li>
                  <li><strong>Copy/Cut/Paste:</strong> Completely disabled. Copy attempts: <strong className="text-red-900">{copyAttempts}</strong></li>
                  <li><strong>Right-Click:</strong> Context menu is blocked</li>
                  <li><strong>Text Selection:</strong> Disabled to prevent copying</li>
                  <li><strong>Keyboard Shortcuts:</strong> Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A, F12 blocked</li>
                  <li><strong>Developer Tools:</strong> Access is restricted</li>
                </ul>
                <p className="text-xs sm:text-sm text-red-800 font-semibold mt-2">
                  ⚠️ Violation of these rules may result in automatic disqualification!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;