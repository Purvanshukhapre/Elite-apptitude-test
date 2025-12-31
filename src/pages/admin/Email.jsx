import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/useApp';
import { sendEmail } from '../../api';

const Email = () => {
  const { applicants, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    recipient: '',
    recipientName: ''
  });
  const [isFromApplicantList, setIsFromApplicantList] = useState(false);

  const filteredApplicants = useMemo(() => {
    if (searchTerm) {
      return applicants.filter(applicant => {
        const name = applicant.fullName || applicant.name || '';
        const email = applicant.permanentEmail || applicant.email || '';
        const position = applicant.postAppliedFor || applicant.position || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               position.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    return applicants;
  }, [searchTerm, applicants]);

  const handleComposeEmail = (applicant) => {
    setEmailData({
      subject: '',
      body: '',
      recipient: applicant.permanentEmail || applicant.email || '',
      recipientName: applicant.fullName || applicant.name || 'Applicant'
    });
    setIsFromApplicantList(true);
    setShowComposeModal(true);
  };

  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!emailData.recipient || !emailData.subject || !emailData.body) {
      alert('Please fill in all required fields (To, Subject, and Message)');
      return;
    }
    
    setIsSending(true);
    try {
      const emailPayload = {
        to: emailData.recipient,
        subject: emailData.subject,
        message: emailData.body
      };
      
      await sendEmail(emailPayload);
      alert('Email sent successfully!');
      setShowComposeModal(false);
      setEmailData({ subject: '', body: '', recipient: '', recipientName: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-500 mt-1">Send emails to applicants</p>
        </div>
        <button
          onClick={() => {
            setEmailData({ subject: '', body: '', recipient: '', recipientName: '' });
            setIsFromApplicantList(false);
            setShowComposeModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Compose Email</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search applicants by name, email, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
          />
          <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Applicants Email List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Applicants</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredApplicants.length} applicants found</p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Applicant</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Position</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No applicants found</p>
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant, index) => {
                    const hasTest = applicant.testData || applicant.correctAnswer !== undefined;
                    return (
                      <tr key={applicant._id || applicant.id || index} className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                              {(applicant.fullName || applicant.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{applicant.fullName || applicant.name || 'Unknown'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{applicant.permanentEmail || applicant.email || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                            {applicant.postAppliedFor || applicant.position || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            hasTest ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {hasTest ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleComposeEmail(applicant)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                          >
                            Compose
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Compose Email</h2>
                  <p className="text-sm text-gray-500 mt-1">Send email to applicant</p>
                </div>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Email Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={emailData.recipient}
                      onChange={(e) => setEmailData({...emailData, recipient: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 font-medium"
                      placeholder={isFromApplicantList ? "Email will be auto-filled" : "Enter any email address"}
                    />
                    {emailData.recipientName && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {emailData.recipientName}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    value={emailData.body}
                    onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Write your message here..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={isSending}
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Send Email'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;
