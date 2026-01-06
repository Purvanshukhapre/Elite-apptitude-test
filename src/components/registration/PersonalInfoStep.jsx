import React, { useState } from 'react';

const PersonalInfoStep = ({ formData, setFormData, errors, setErrors, onEmailVerified }) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendVerification = async () => {
    if (!formData.permanentEmail || !formData.permanentEmail.trim()) {
      setErrors(prev => ({ ...prev, permanentEmail: 'Please enter your email address' }));
      return;
    }
    
    setIsSendingVerification(true);
    try {
      const response = await fetch('https://eliterecruitmentbackend-production.up.railway.app/email-verification/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.permanentEmail }),
      });
      
      // Try to parse the response as JSON, even for error responses
      let data = {};
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a default error message
        console.warn('Failed to parse response as JSON:', parseError);
      }
      
      if (response.ok) {
        console.log('Verification email sent:', data);
        setShowVerificationModal(true);
        // Reset verification state
        setIsEmailVerified(false);
        setVerificationCode('');
      } else {
        // Handle different error responses from the backend
        if (data.message && data.message.toLowerCase().includes('already')) {
          setErrors(prev => ({ ...prev, permanentEmail: data.message || 'This email is already registered' }));
        } else if (data.error && data.error.toLowerCase().includes('already')) {
          setErrors(prev => ({ ...prev, permanentEmail: data.error || 'This email is already registered' }));
        } else {
          setErrors(prev => ({ ...prev, permanentEmail: data.message || data.error || 'Failed to send verification email' }));
        }
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setErrors(prev => ({ ...prev, permanentEmail: 'Network error. Please try again.' }));
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrors(prev => ({ ...prev, verificationCode: 'Please enter the verification code' }));
      return;
    }
    
    setIsVerifying(true);
    try {
      const response = await fetch('https://eliterecruitmentbackend-production.up.railway.app/email-verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationCode }),
      });
      
      // Try to parse the response as JSON, even for error responses
      let data = {};
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a default error message
        console.warn('Failed to parse response as JSON:', parseError);
      }
      
      if (response.ok) {
        console.log('Email verified:', data);
        setIsEmailVerified(true);
        if (onEmailVerified) {
          onEmailVerified(true);
        }
        setShowVerificationModal(false);
        setErrors(prev => ({ ...prev, verificationCode: '' }));
      } else {
        // Handle different error responses from the backend
        if (data.message && data.message.toLowerCase().includes('already')) {
          setErrors(prev => ({ ...prev, verificationCode: data.message || 'This email is already registered' }));
          // Also set the email error since the email is already registered
          setErrors(prev => ({ ...prev, permanentEmail: data.message || 'This email is already registered' }));
        } else if (data.error && data.error.toLowerCase().includes('already')) {
          setErrors(prev => ({ ...prev, verificationCode: data.error || 'This email is already registered' }));
          // Also set the email error since the email is already registered
          setErrors(prev => ({ ...prev, permanentEmail: data.error || 'This email is already registered' }));
        } else {
          setErrors(prev => ({ ...prev, verificationCode: data.message || data.error || 'Invalid verification code' }));
        }
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrors(prev => ({ ...prev, verificationCode: 'Network error. Please try again.' }));
    } finally {
      setIsVerifying(false);
    }
  };

  // Add verification modal
  const VerificationModal = () => {
    if (!showVerificationModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Email Verification</h3>
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">We've sent a verification code to <span className="font-semibold">{formData.permanentEmail}</span></p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyCode();
                  }
                }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
              />
              {errors.verificationCode && (
                <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>
              )}
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={isVerifying}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-lg transition-all duration-200">
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ''}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.fullName ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.fullName}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Father's Name <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-lg transition-all duration-200">
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName || ''}
              onChange={handleChange}
              placeholder="Enter father's name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.fatherName ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
            />
          </div>
          {errors.fatherName && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.fatherName}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-lg transition-all duration-200">
            <input
              type="number"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
              placeholder="Enter your age"
              min="1"
              max="120"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.age ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
            />
          </div>
          {errors.age && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.age}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marital Status <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Single', 'Married'].map((status) => (
              <label key={status} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="maritalStatus"
                  value={status}
                  checked={formData.maritalStatus === status}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm font-medium text-gray-700">{status}</span>
              </label>
            ))}
          </div>
          {errors.maritalStatus && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.maritalStatus}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2 md:w-1/2">
          {['Male', 'Female', 'Other'].map((gender) => (
            <label key={gender} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="sex"
                value={gender}
                checked={formData.sex === gender}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm font-medium text-gray-700">{gender}</span>
            </label>
          ))}
        </div>
        {errors.sex && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.sex}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-lg transition-all duration-200">
            <input
              type="email"
              name="permanentEmail"
              value={formData.permanentEmail || ''}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 pr-24 text-gray-900 ${errors.permanentEmail ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              disabled={isEmailVerified}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isEmailVerified ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={isSendingVerification}
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingVerification ? 'Sending...' : 'Verify'}
                </button>
              )}
            </div>
          </div>
          {errors.permanentEmail && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.permanentEmail}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-lg transition-all duration-200">
            <input
              type="tel"
              name="permanentPhone"
              value={formData.permanentPhone || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 10) {
                  handleChange({target: {name: 'permanentPhone', value}});
                }
              }}
              placeholder="Enter your phone number"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.permanentPhone ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
            />
          </div>
          {errors.permanentPhone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.permanentPhone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages Known <span className="text-red-500">*</span>
        </label>
        <div className="relative rounded-lg transition-all duration-200">
          <input
            type="text"
            name="language"
            placeholder="Enter languages you know (e.g. English, Hindi, Tamil)"
            value={formData.language || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.language ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
          />
        </div>
        {errors.language && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.language}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <div className="relative rounded-lg transition-all duration-200">
          <textarea
            name="permanentAddressLine"
            rows={2}
            value={formData.permanentAddressLine || ''}
            onChange={handleChange}
            placeholder="Enter your complete address"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-all duration-200 resize-none text-gray-900 ${errors.permanentAddressLine ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
          />
        </div>
        {errors.permanentAddressLine && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.permanentAddressLine}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pincode <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-lg transition-all duration-200">
            <input
              type="text"
              name="permanentPin"
              value={formData.permanentPin || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 6) {
                  handleChange(e);
                }
              }}
              placeholder="Enter your pincode"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.permanentPin ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
            />
          </div>
          {errors.permanentPin && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.permanentPin}
            </p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Reference Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Reference Name
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="text"
                name="reference1Name"
                value={formData.reference1Name || ''}
                onChange={handleChange}
                placeholder="Enter reference name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.reference1Name ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.reference1Name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.reference1Name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Reference Phone
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="tel"
                name="reference1Mobile"
                value={formData.reference1Mobile || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 10) {
                    handleChange({target: {name: 'reference1Mobile', value}});
                  }
                }}
                placeholder="Enter contact number"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.reference1Mobile ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.reference1Mobile && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.reference1Mobile}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Second Reference Name
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="text"
                name="reference2Name"
                value={formData.reference2Name || ''}
                onChange={handleChange}
                placeholder="Enter reference name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.reference2Name ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.reference2Name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.reference2Name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Second Reference Phone
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="tel"
                name="reference2Mobile"
                value={formData.reference2Mobile || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 10) {
                    handleChange({target: {name: 'reference2Mobile', value}});
                  }
                }}
                placeholder="Enter contact number"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.reference2Mobile ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.reference2Mobile && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.reference2Mobile}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    <VerificationModal />
  </div>
  );
};

export default PersonalInfoStep;