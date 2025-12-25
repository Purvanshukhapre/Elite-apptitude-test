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
    title: 'Mr',
    fullName: '',
    fatherName: '',
    dob: '',
    age: '',
    maritalStatus: '',
    gender: '',
    countryCode: '+91',
    email: '',
    phone: '',
    education: '',
    languages: '',
    address: '',
    experience: '',
    position: '',
    expectedSalary: '',
    resumeLink: '',
    coverLetter: '',
    experienceLevel: '',
    primarySkills: [],
    secondarySkills: [],
    institution: '',
    boardType: '',
    boardName: '',
    examPassed: '',
    yearOfPassing: '',
    mainSubjects: '',
    percentage: '',
    experienceFromText: '',
    experienceToText: '',
    designation: '',
    briefJobProfile: '',
    pincode: '',
    referenceNumber: '',
    contactNumber: '',
    referenceNumber2: '',
    contactNumber2: '',
  });
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.fatherName.trim())
      newErrors.fatherName = 'Father name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.education.trim()) newErrors.education = 'Education is required';

    if (!formData.languages.trim())
      newErrors.languages = 'Languages known is required';
    
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.dob || formData.dob.trim() === '') newErrors.dob = 'Date of birth is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.position) newErrors.position = 'Please select a position';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    if (!formData.institution) newErrors.institution = 'Institution name is required';
    if (!formData.boardType) newErrors.boardType = 'Board/University type is required';
    if (!formData.boardName) newErrors.boardName = 'Board/University name is required';
    if (!formData.examPassed) newErrors.examPassed = 'Examination passed is required';
    if (!formData.yearOfPassing) newErrors.yearOfPassing = 'Year of passing is required';
    if (!formData.mainSubjects) newErrors.mainSubjects = 'Main subjects are required';
    if (!formData.percentage) newErrors.percentage = 'Percentage/CGPA is required';
    
    // Only validate work experience fields if user has experience
    if (formData.experience !== 'fresher') {
      if (!formData.designation) newErrors.designation = 'Designation is required';
      if (!formData.briefJobProfile) newErrors.briefJobProfile = 'Brief job profile is required';
      if (!formData.experienceFromText) newErrors.experienceFromText = 'Experience from date is required';
      if (!formData.experienceToText) newErrors.experienceToText = 'Experience to date is required';
    }
    
    if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
    
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
    try {
      const applicant = await addApplicant(formData);
      setCurrentApplicant(applicant);
      navigate('/test');
    } catch (error) {
      console.error('Failed to submit application:', error);
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
             formData.email?.trim() && 
             /\S+@\S+\.\S+/.test(formData.email) &&
             formData.phone?.trim() && 
             /^\d{10}$/.test(formData.phone.replace(/[-\s]/g, '')) &&
             formData.education?.trim() && 
             formData.languages?.trim() &&
             formData.address?.trim() &&
             formData.dob?.trim() &&
             formData.maritalStatus &&
             formData.gender &&
             formData.pincode?.trim();
    } else if (step === 2) {
      // Validate required fields for all users
      const basicValid = formData.position && 
             formData.experience && 
             formData.institution?.trim() && 
             formData.boardType && 
             formData.boardName?.trim() && 
             formData.examPassed?.trim() && 
             formData.yearOfPassing && 
             formData.mainSubjects?.trim() && 
             formData.percentage?.trim() && 
             formData.experienceLevel;
      
      // If user is not a fresher, validate work experience fields
      if (formData.experience !== 'fresher') {
        return basicValid && 
               formData.designation?.trim() && 
               formData.briefJobProfile?.trim() && 
               formData.experienceFromText?.trim() && 
               formData.experienceToText?.trim();
      }
      
      // If user is a fresher, work experience fields are not required
      return basicValid;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-[#82A1D2] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Elite Associate</h1>
          <p className="text-blue-100">Complete your registration to begin the aptitude test</p>
        </div>

        {/* Progress Bar */}
        <ProgressBar step={step} />

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 animate-slide-up shadow-[0_10px_20px_rgba(0,0,0,0.15),0_25px_50px_rgba(0,0,0,0.25)]">
          <form id="registration-form">
            {renderStep()}
            
            <NavigationButtons
              step={step}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isValid={isStepValid()}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;