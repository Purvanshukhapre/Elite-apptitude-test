import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { sendResumeWithEmail } from '../../api';
import ProgressBar from '../../components/registration/ProgressBar';
import PersonalInfoStep from '../../components/registration/PersonalInfoStep';
import PositionDetailsStep from '../../components/registration/PositionDetailsStep';
import ReviewStep from '../../components/registration/ReviewStep';
import NavigationButtons from '../../components/registration/NavigationButtons';
import logo from "../../assets/elitelogo.png";
import polyBg from "../../assets/1397.jpg";

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
    resume: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.fatherName?.trim())
      newErrors.fatherName = 'Father name is required';

    if (!formData.permanentEmail?.trim()) {
      newErrors.permanentEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.permanentEmail)) {
      newErrors.permanentEmail = 'Email is invalid';
    } else if (!isEmailVerified) {
      newErrors.permanentEmail = 'Email must be verified';
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
    if (!formData.permanentPin?.trim()) {
      newErrors.permanentPin = 'Pincode is required';
    } else if (formData.permanentPin.length !== 6 || !/^[0-9]{6}$/.test(formData.permanentPin)) {
      newErrors.permanentPin = 'Pincode must be exactly 6 digits';
    }
    
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
    
    // Make resume optional to avoid blocking registration
    // Resume will be uploaded separately if provided
    // if (!formData.resume) newErrors.resume = 'Resume is required';
    
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

  const handleResumeChange = (resumeFile) => {
    setFormData(prev => ({
      ...prev,
      resume: resumeFile
    }));
    
    // Clear resume error when a new file is selected
    if (errors.resume) {
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const applicant = await addApplicant(formData);
      
      // Send resume with email if it exists
      if (formData.resume) {
        try {
          await sendResumeWithEmail(formData.permanentEmail, formData.resume);
          console.log('Resume sent with email successfully');
        } catch (resumeError) {
          console.error('Failed to send resume with email:', resumeError);
          // Continue with form submission even if resume email fails
        }
      }
      
      setCurrentApplicant(applicant);
      
      // Note: Questions are already set in the AppContext after form submission
      // No need to set them again here as they're available in the context
      
      navigate('/test');
    } catch (error) {
      console.error('Failed to submit application:', error);
      // Even if submission fails, try to continue
      navigate('/test');
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
            onEmailVerified={(isVerified) => {
              setIsEmailVerified(isVerified);
              if (isVerified) {
                // Email is verified, user can proceed
                console.log('Email verified, user can proceed');
              }
            }}
          />
        );
      case 2:
        return (
          <PositionDetailsStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onResumeChange={handleResumeChange}
          />
        );
      case 3:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* ===== ANIMATED LOW-POLY BACKGROUND ===== */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-bgDrift"
        style={{ backgroundImage: `url(${polyBg})` }}
      />

      {/* Soft global overlay (very light) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-blue-800/30" />

      {/* Center focus overlay for readability */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.2)_40%,rgba(0,0,0,0)_70%)]" />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between p-0 sm:p-6">
        {/* LOGO */}
        <header className="pt-6 sm:pt-8 w-full max-w-4xl">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 sm:px-8 sm:py-5 shadow-2xl border border-gray-200">
              <img
                src={logo}
                alt="Elite Associate"
                className="h-12 sm:h-16 md:h-20 w-auto mx-auto"
              />
            </div>
          </div>
        </header>

        {/* FORM CONTENT */}
        <main className="flex-grow flex items-center w-full max-w-4xl mx-auto">
          <div className="w-full max-w-4xl mx-auto px-0 sm:px-4">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                Complete Your Registration
              </h1>
              <p className="text-blue-100 text-base sm:text-lg md:text-xl opacity-90">
                Fill in your details to begin the aptitude test
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <ProgressBar step={step} />
            </div>

            {/* Form Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 animate-slide-up shadow-2xl border border-white/30">
              {step !== 3 && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {step === 1 && 'Personal Information'}
                    {step === 2 && 'Position & Experience Details'}
                  </h2>
                  <p className="text-gray-600">
                    {step === 1 && 'Please provide your personal details'}
                    {step === 2 && 'Tell us about your experience and qualifications'}
                  </p>
                </div>
              )}
              
              <form id="registration-form" className="space-y-6">
                {renderStep()}
                
                <NavigationButtons
                  step={step}
                  onBack={handleBack}
                  onNext={handleNext}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </form>
            </div>
            
            <div className="text-center mt-6 text-blue-100/80 text-sm">
              <p>Need help? Contact our support team at support@eliteassociate.com</p>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="pb-4 text-blue-200/80 text-sm text-center">
          © {new Date().getFullYear()} Elite Associate — Placement & Training Center
        </footer>
      </div>

      {/* ===== BACKGROUND ANIMATION ===== */}
      <style>
        {`
          @keyframes bgDrift {
            0% {
              transform: scale(1) translate(0, 0);
            }
            50% {
              transform: scale(1.05) translate(-10px, -10px);
            }
            100% {
              transform: scale(1) translate(0, 0);
            }
          }

          .animate-bgDrift {
            animation: bgDrift 30s ease-in-out infinite;
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-slide-up {
            animation: slide-up 0.6s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Registration;