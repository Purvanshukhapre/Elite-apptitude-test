import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ActionButtons = ({ applicant, navigate }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownloadPDF = () => {
    if (!applicant) return;
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Applicant Details Report', 20, 20);
      
      // Add applicant info
      doc.setFontSize(14);
      doc.text('Applicant Information', 20, 40);
      
      // Draw a line
      doc.line(20, 45, 190, 45);
      
      // Add applicant details in a table format
      const applicantDetails = [
        ['Full Name', applicant.fullName || 'N/A'],
        ['Email', applicant.permanentEmail || applicant.email || 'N/A'],
        ['Phone', applicant.permanentPhone || applicant.phone || 'N/A'],

        ['Age', applicant.age || 'N/A'],
        ['Gender', applicant.sex || 'N/A'],
        ['Marital Status', applicant.maritalStatus || 'N/A'],
        ['Applied Position', applicant.postAppliedFor || applicant.position || 'N/A'],
        ['Address', applicant.permanentAddressLine || 'N/A'],
        ['Pin Code', applicant.permanentPin || 'N/A'],
        ['Test Status', (applicant.testResult && applicant.testResult.correctAnswer !== undefined) || 
                     (applicant.testData && applicant.testData.score) || 
                     (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null) ? 'Completed' : 'Pending'],
        ['Overall Score', `${getScore(applicant).toFixed(1)}%`],
        ['Correct Answers', `${getCorrectAnswers(applicant)}/15`],
        ['Pass/Fail Status', getScore(applicant) >= 60 ? 'PASS' : 'FAIL'],
        ['Time Spent', formatTime(getTimeSpent(applicant))],
        ['Feedback Rating', applicant.overallRating !== undefined && applicant.overallRating !== null ? applicant.overallRating : 'N/A']
      ];
      
      autoTable(doc, {
        startY: 50,
        head: [['Field', 'Value']],
        body: applicantDetails,
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 4,
          valign: 'middle'
        },
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 110 }
        },
        margin: { left: 15 }
      });

    // Add academic records if available
    if (applicant.academicRecords && applicant.academicRecords.length > 0) {
      let lastY = 20; // Start at top of page if no previous table exists
      if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
        lastY = doc.lastAutoTable.finalY + 10;
      }
      doc.setFontSize(14);
      doc.text('Academic Records', 20, lastY);
      
      const academicData = applicant.academicRecords.flatMap((record, index) => [
        ['Record ' + (index + 1), ''],
        ['Board/University', record.boardOrUniversity || 'N/A'],
        ['Examination', record.examinationPassed || 'N/A'],
        ['Main Subjects', record.mainSubjects || 'N/A'],
        ['Percentage', record.percentage || 'N/A'],
        ['Institution', record.schoolOrCollege || 'N/A'],
        ['Year of Passing', record.yearOfPassing || 'N/A'],
        ['', ''] // Empty row as separator
      ]);
      
      autoTable(doc, {
        startY: lastY + 5,
        head: [['Field', 'Value']],
        body: academicData,
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 4,
          valign: 'middle'
        },
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 110 }
        },
        margin: { left: 15 }
      });
    }
    
    // Add work experience if available
    if (applicant.workExperiences && applicant.workExperiences.length > 0) {
      let lastY = 20; // Start at top of page if no previous table exists
      if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
        lastY = doc.lastAutoTable.finalY + 10;
      }
      doc.setFontSize(14);
      doc.text('Work Experience', 20, lastY);
      
      const workData = applicant.workExperiences.flatMap((exp, index) => [
        ['Experience ' + (index + 1), ''],
        ['Employer', exp.employerName || 'N/A'],
        ['Designation', exp.designation || 'N/A'],
        ['Duration', `${exp.durationFrom || 'N/A'} to ${exp.durationTo || 'N/A'}`],
        ['Joining Date', exp.joiningDate || 'N/A'],
        ['Last Date', exp.lastDate || 'N/A'],
        ['Salary', exp.totalSalary || 'N/A'],
        ['Job Profile', exp.briefJobProfile || 'N/A'],
        ['', ''] // Empty row as separator
      ]);
      
      autoTable(doc, {
        startY: lastY + 5,
        head: [['Field', 'Value']],
        body: workData,
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 4,
          valign: 'middle'
        },
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 110 }
        },
        margin: { left: 15 }
      });
    }
    
    // Add page numbers if needed
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`applicant-details-${applicant.fullName || applicant.name || 'applicant'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };

  const handleDeleteApplicant = async () => {
    if (!window.confirm('Are you sure you want to delete this applicant and all their related data (feedback, resume, test results)? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Get the actual ID to use for deletion
      const actualId = applicant._id || applicant.id;
      if (!actualId) {
        alert('Unable to delete: No valid ID found for this applicant');
        setIsDeleting(false);
        return;
      }
      
      // Call the delete API function
      const { deleteApplicantById } = await import('../../../api');
      await deleteApplicantById(actualId);
      
      alert('Applicant and all related data deleted successfully');
      navigate('/admin/modern/applicants');
    } catch (error) {
      console.error('Error deleting applicant:', error);
      alert(`Failed to delete applicant: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper functions
  const getScore = (applicant) => {
    // Use test result data if available (from /result/all API) - prioritize test results over feedback
    if (applicant.testResult && applicant.testResult.correctAnswer !== undefined) {
      const totalQuestions = 15; // Fixed total as per API
      return (applicant.testResult.correctAnswer / totalQuestions) * 100;
    }
    
    if (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null) {
      const totalQuestions = 15; // Fixed total as per API
      return (applicant.correctAnswer / totalQuestions) * 100;
    }
    
    const testData = applicant.testData;
    if (testData) {
      if (typeof testData.score === 'string' && testData.score.includes('/')) {
        const [correct, total] = testData.score.split('/').map(Number);
        if (total > 0) {
          return (correct / total) * 100;
        }
      }
      
      if (testData.percentage) {
        return parseFloat(testData.percentage);
      }
      
      if (testData.score && typeof testData.score === 'number') {
        return testData.score;
      }
      
      if (testData.correctAnswers !== undefined && testData.totalQuestions) {
        return (testData.correctAnswers / testData.totalQuestions) * 100;
      }
    }
    
    // Only use feedback ratings if no test data is available
    if (applicant.overallRating !== undefined && applicant.overallRating !== null) {
      return (applicant.overallRating / 5) * 100;
    }
    
    if (applicant.rating !== undefined && applicant.rating !== null) {
      return (applicant.rating / 5) * 100;
    }
    
    return 0;
  };

  const getCorrectAnswers = (applicant) => {
    return (applicant.testResult && applicant.testResult.correctAnswer !== undefined) 
      ? applicant.testResult.correctAnswer 
      : (applicant.testData?.correctAnswers !== undefined ? applicant.testData.correctAnswers : 
         (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null ? applicant.correctAnswer : 0));
  };

  const getTimeSpent = (applicant) => {
    return applicant.testData?.timeSpent || 0; // in seconds
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex justify-end space-x-4">
      <button
        onClick={handleDeleteApplicant}
        disabled={isDeleting}
        className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>{isDeleting ? 'Deleting...' : 'Delete Applicant'}</span>
      </button>
      <button
        onClick={handleDownloadPDF}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        <span>Download PDF</span>
      </button>
      <button
        onClick={() => navigate('/admin/modern/applicants')}
        className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
      >
        Back to Applicants
      </button>
    </div>
  );
};

export default ActionButtons;