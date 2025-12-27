import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import ProgressBar from '../../components/registration/ProgressBar';
import PersonalInfoStep from '../../components/registration/PersonalInfoStep';
import PositionDetailsStep from '../../components/registration/PositionDetailsStep';
import ReviewStep from '../../components/registration/ReviewStep';
import NavigationButtons from '../../components/registration/NavigationButtons';

const Registration = () => {
  const navigate = useNavigate();
  const { addApplicant, setCurrentApplicant } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    postAppliedFor: '',
    dateOfBirth: '',
    age: '',
    maritalStatus: '',
    sex: '',
    linkedInProfile: '',
    language: '',
    permanentAddressLine: '',
    permanentPin: '',
    permanentPhone: '',
    permanentEmail: '',
    reference1Name: '',
    reference1Mobile: '',
    reference2Name: '',
    reference2Mobile: '',
    experienceLevel: '',
    yearsOfExperience: '',
    primarySkills: [],
    secondarySkills: [],
    academicRecords: [{
      schoolOrCollege: '',
      boardOrUniversity: '',
      examinationPassed: '',
      yearOfPassing: '',
      mainSubjects: '',
      percentage: '',
    }],
    workExperiences: [{
      employerName: '',
      durationFrom: '',
      durationTo: '',
      designation: '',
      briefJobProfile: '',
      totalSalary: 0,
      joiningDate: '',
      lastDate: '',
    }],
    experience: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.fatherName?.trim())
      newErrors.fatherName = 'Father name is required';

    if (!formData.permanentEmail?.trim()) {
      newErrors.permanentEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.permanentEmail)) {
      newErrors.permanentEmail = 'Email is invalid';
    }
    if (!formData.permanentPhone?.trim()) {
      newErrors.permanentPhone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.permanentPhone.replace(/[-\s]/g, ''))) {
      newErrors.permanentPhone = 'Phone number must be 10 digits';
    }
    
    if (!formData.language?.trim())
      newErrors.language = 'Languages known is required';
    
    if (!formData.permanentAddressLine?.trim()) newErrors.permanentAddressLine = 'Address is required';
    if (!formData.age || formData.age.toString().trim() === '') newErrors.age = 'Age is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.sex) newErrors.sex = 'Gender is required';
    if (!formData.permanentPin?.trim()) newErrors.permanentPin = 'Pincode is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.postAppliedFor?.trim()) newErrors.postAppliedFor = 'Position applied for is required';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    if (!formData.academicRecords[0].schoolOrCollege?.trim()) newErrors.schoolOrCollege = 'Institution name is required';
    if (!formData.academicRecords[0].boardOrUniversity?.trim()) newErrors.boardOrUniversity = 'Board/University name is required';
    if (!formData.academicRecords[0].examinationPassed?.trim()) newErrors.examinationPassed = 'Examination passed is required';
    if (!formData.academicRecords[0].yearOfPassing) newErrors.yearOfPassing = 'Year of passing is required';
    if (!formData.academicRecords[0].mainSubjects?.trim()) newErrors.mainSubjects = 'Main subjects are required';
    if (!formData.academicRecords[0].percentage) newErrors.percentage = 'Percentage/CGPA is required';
    
    // Only validate work experience fields if user has experience
    if (formData.experience !== 'fresher') {
      if (!formData.workExperiences[0].designation?.trim()) newErrors.designation = 'Designation is required';
      if (!formData.workExperiences[0].briefJobProfile?.trim()) newErrors.briefJobProfile = 'Brief job profile is required';
      if (!formData.workExperiences[0].durationFrom?.trim()) newErrors.durationFrom = 'Experience from date is required';
      if (!formData.workExperiences[0].durationTo?.trim()) newErrors.durationTo = 'Experience to date is required';
      if (!formData.workExperiences[0].employerName?.trim()) newErrors.employerName = 'Employer name is required';
    }
    
    if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
    if (!formData.primarySkills || formData.primarySkills.length === 0) newErrors.primarySkills = 'At least one primary skill is required';
    if (!formData.secondarySkills || formData.secondarySkills.length === 0) newErrors.secondarySkills = 'At least one secondary skill is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const applicant = await addApplicant(formData);
      setCurrentApplicant(applicant);
      navigate('/test');
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <PositionDetailsStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 3:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    // Simple validation without triggering state updates
    if (step === 1) {
      return formData.fullName?.trim() && 
             formData.fatherName?.trim() && 
             formData.permanentEmail?.trim() && 
             /\S+@\S+\.\S+/.test(formData.permanentEmail) &&
             formData.permanentPhone?.trim() && 
             /^\d{10}$/.test(formData.permanentPhone.replace(/[-\s]/g, '')) &&
             formData.language?.trim() &&
             formData.permanentAddressLine?.trim() &&
             formData.age?.toString().trim() &&
             formData.maritalStatus &&
             formData.sex &&
             formData.permanentPin?.trim();
    } else if (step === 2) {
      // Validate required fields for all users
      const basicValid = formData.postAppliedFor && 
             formData.experience && 
             formData.academicRecords[0].schoolOrCollege?.trim() && 
             formData.academicRecords[0].boardOrUniversity?.trim() && 
             formData.academicRecords[0].examinationPassed?.trim() && 
             formData.academicRecords[0].yearOfPassing && 
             formData.academicRecords[0].mainSubjects?.trim() && 
             formData.academicRecords[0].percentage?.trim() && 
             formData.experienceLevel &&
             formData.primarySkills && formData.primarySkills.length > 0 &&
             formData.secondarySkills && formData.secondarySkills.length > 0;
      
      // If user is not a fresher, validate work experience fields
      if (formData.experience !== 'fresher') {
        return basicValid && 
               formData.workExperiences[0].designation?.trim() && 
               formData.workExperiences[0].briefJobProfile?.trim() && 
               formData.workExperiences[0].durationFrom?.trim() && 
               formData.workExperiences[0].durationTo?.trim() &&
               formData.workExperiences[0].employerName?.trim();
      }
      
      // If user is a fresher, work experience fields are not required
      return basicValid;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-[#82a1d2] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Elite Associate</h1>
          <p className="text-blue-100 text-lg">Complete your registration to begin the aptitude test</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar step={step} />
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 animate-slide-up shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-white/20">
          <form id="registration-form">
            {renderStep()}
            
            <NavigationButtons
              step={step}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isValid={isStepValid()}
              isSubmitting={isSubmitting}
            />
          </form>
        </div>
        
        <div className="text-center mt-6 text-blue-100 text-sm">
          <p>Need help? Contact our support team at support@eliteassociate.com</p>
        </div>
      </div>
    </div>
  );
};

export default Registration;