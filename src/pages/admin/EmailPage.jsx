import { useState } from 'react';
import { useApp } from '../../context/useApp';
import AdminLayout from '../../components/AdminLayout';

const EmailPage = () => {
  const { applicants } = useApp();
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [, setSelectedApplicant] = useState(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Use mock data if applicants from context is empty
  const mockApplicants = [
    { id: 1, fullName: 'John Doe', email: 'john.doe@example.com', position: 'Software Engineer', status: 'Pending' },
    { id: 2, fullName: 'Jane Smith', email: 'jane.smith@example.com', position: 'Product Manager', status: 'Completed' },
    { id: 3, fullName: 'Robert Johnson', email: 'robert.j@example.com', position: 'Designer', status: 'Pending' },
    { id: 4, fullName: 'Emily Davis', email: 'emily.d@example.com', position: 'Data Analyst', status: 'Completed' },
    { id: 5, fullName: 'Michael Wilson', email: 'michael.w@example.com', position: 'DevOps Engineer', status: 'Pending' },
  ];

  const applicantList = applicants && applicants.length > 0 ? applicants : mockApplicants;

  const handleComposeClick = (applicant) => {
    setSelectedApplicant(applicant);
    setEmailData({
      to: applicant.email || applicant.permanentEmail || '',
      subject: '',
      message: ''
    });
    setIsComposeModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Placeholder API call - will be replaced with actual API later
      await sendEmail({ ...emailData });
      
      setMessage('Email sent successfully!');
      setEmailData({ to: '', subject: '', message: '' });
      setIsComposeModalOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      setMessage('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder function for sending email
  const sendEmail = async ({ to, subject, message }) => {
    // This will be replaced with actual API call later
    console.log('Sending email:', { to, subject, message });
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  };

  const handleCloseModal = () => {
    setIsComposeModalOpen(false);
    setMessage('');
  };

  return (
    <AdminLayout activeTab="email">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600">Send emails to applicants</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Applicants List</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applicantList.map((applicant, index) => (
                  <tr key={applicant.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {applicant.fullName || applicant.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {applicant.email || applicant.permanentEmail || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {applicant.position || applicant.postAppliedFor || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (applicant.status || applicant.testData) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {applicant.status || (applicant.testData ? 'Completed' : 'Pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleComposeClick(applicant)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Compose
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compose Email Modal */}
        {isComposeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Compose Email</h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <input
                      type="email"
                      id="to"
                      name="to"
                      value={emailData.to}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={emailData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={emailData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your message here..."
                    />
                  </div>

                  {message && (
                    <div className={`p-3 rounded-lg ${
                      message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
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
    </AdminLayout>
  );
};

export default EmailPage;