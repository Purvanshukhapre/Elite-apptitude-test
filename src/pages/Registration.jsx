import { useState } from 'react';
import logo from "../assets/elitelogo.png";
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { positions } from '../data/questions';


const Registration = () => {
  const navigate = useNavigate();
  const { addApplicant, setCurrentApplicant } = useApp();
  const [step, setStep] = useState(1);
  const [primarySkillInput, setPrimarySkillInput] = useState('');
  const [secondarySkillInput, setSecondarySkillInput] = useState('');
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.position) newErrors.position = 'Please select a position';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
    // When step is 3, clicking Next should submit the form
    // But we'll handle this with the submit button instead
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const applicant = await addApplicant(formData);
      setCurrentApplicant(applicant);
      navigate('/test');
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-[#82A1D2] flex items-center justify-center p-4">
      
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Elite Associate</h1>
          <p className="text-blue-100">Complete your registration to begin the aptitude test</p>
        </div>
          {/* {Progress Bar} */}
          <div className="mb-10">
            <div className="relative flex items-center justify-between">

              {/* Base line (connected to circles) */}
              <div className="absolute top-6 left-[16.66%] right-[16.66%] h-1 bg-[#577FCD] rounded-full" />

              {[1, 2, 3].map((s) => (
                <div key={s} className="relative z-10 flex flex-col items-center w-1/3">

                  {/* Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2
                    ${
                      step > s || (step === s && s !== 3)
                        ? "bg-[#577FCD] border-blue-400 text-white"
                        : "bg-white border-blue-700 text-blue-700"
                    }`}
                  >
                    {(step > s || (step === s && s !== 3)) && (
                      <span className="text-xl font-bold">✓</span>
                    )}
                  </div>

                  {/* Label */}
                  <span className="mt-3 text-sm font-semibold tracking-wider text-white">
                    {s === 1 && "PERSONAL INFO"}
                    {s === 2 && "POSITION DETAILS"}
                    {s === 3 && "REVIEW"}
                  </span>

                </div>
              ))}
            </div>
          </div>




        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 animate-slide-up
            shadow-[0_10px_20px_rgba(0,0,0,0.15),0_25px_50px_rgba(0,0,0,0.25)]">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <div
                    className={`flex h-10 items-center border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                      errors.fullName ? 'border-red-500' : 'border-gray-500'
                    }`}
                  >
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="h-11 px-3 bg-transparent text-gray-700 border-none outline-none rounded-l-lg"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Miss">Miss</option>
                      <option value="Mrs">Mrs</option>
                    </select>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-300"></div>

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Name"
                      className="w-full px-3 bg-transparent outline-none border-none"
                    />
                  </div>

                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name <span className="text-red-500">*</span>
                  </label>

                  <div
                    className={`flex h-10 items-center border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                      errors.fatherName ? 'border-red-500' : 'border-gray-500'
                    }`}
                  >
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      placeholder="Father's Name"
                      className="w-full h-11 px-3 bg-transparent outline-none border-none"
                    />
                  </div>

                  {errors.fatherName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>
                  )}
                </div>

                
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>

                    <div
                      className={`flex h-10 items-center border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.dob ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      {/* Age box */}
                      <input
                        type="text"
                        name="age"
                        value={formData.age || ''}
                        readOnly
                        placeholder="Age"
                        className="w-20 h-9 px-3 bg-gray-100 text-gray-600 outline-none border-none cursor-not-allowed rounded-l-lg"
                      />

                      {/* Date picker */}
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={(e) => {
                          const dobValue = e.target.value;
                          const dob = new Date(dobValue);
                          const today = new Date();

                          let age = today.getFullYear() - dob.getFullYear();
                          const m = today.getMonth() - dob.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                            age--;
                          }

                          setFormData((prev) => ({
                            ...prev,
                            dob: dobValue,
                            age: age,
                          }));
                        }}
                        className="h-9 px-3 bg-transparent outline-none border-none flex-1"
                      />

                    </div>

                    {errors.dob && (
                      <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
                    )}
                  </div>



                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Marital Status <span className="text-red-500">*</span>
                    </label>

                    <div className="flex gap-12">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="Single"
                          checked={formData.maritalStatus === 'Single'}
                          onChange={handleChange}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Single</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="Married"
                          checked={formData.maritalStatus === 'Married'}
                          onChange={handleChange}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Married</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="Divorced"
                          checked={formData.maritalStatus === 'Divorced'}
                          onChange={handleChange}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Divorced</span>
                      </label>
                    </div>

                    {errors.maritalStatus && (
                      <p className="text-red-500 text-sm mt-1">{errors.maritalStatus}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>

                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === 'Male'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Male</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === 'Female'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Female</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={formData.gender === 'Other'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Other</span>
                    </label>
                  </div>

                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>




                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full h-10 px-4 py-3 rounded-lg border border-gray-200
                        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
                        transition ${
                        errors.email ? 'border-red-500' : 'border-gray-500'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>

                    <div
                      className={`flex h-10 items-center border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.phone ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        className="h-9 px-3 bg-transparent text-gray-700 border-none outline-none rounded-l-lg"
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                      </select>

                      {/* Divider */}
                      {/* <div className="h-7 w-px bg-gray-300"></div> */}

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="w-full h-12 px-3 bg-transparent outline-none border-none"
                      />
                    </div>

                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>


                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highest Education <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
                      errors.education ? 'border-red-500' : 'border-gray-500'
          

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Languages Known <span className="text-red-500">*</span>
                  </label>

                  <div
                    className={`border h-10 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                      errors.languages ? 'border-red-500' : 'border-gray-500'
                    }`}
                  >
                    <textarea
                      name="languages"
                      placeholder="e.g. English, Hindi, Tamil"
                      value={formData.languages}
                      onChange={handleChange}
                      rows={3}
                      className="w-full h-10 px-3 py-3 bg-transparent outline-none border-none resize-none placeholder-gray-400"
                    />
                  </div>

                  {errors.languages && (
                    <p className="text-red-500 text-sm mt-1">{errors.languages}</p>
                  )}
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>

                  <div
                    className={`border h-10 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                      errors.address ? 'border-red-500' : 'border-gray-500'
                    }`}
                  >
                    <textarea
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      className="w-full h-10 px-3 py-2 bg-transparent outline-none border-none resize-none placeholder-gray-400"
                    />
                  </div>

                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>


                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>

                  <div
                    className={`border h-10 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                      errors.pincode ? 'border-red-500' : 'border-gray-500'
                    }`}
                  >
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      placeholder="Enter your pincode"
                      className="w-full h-11 px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>

                  {errors.pincode && (
                    <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                  )}
                </div>

                <div className="mt-6">

                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    First Reference 
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Reference Number */}
                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Name
                      </label>

                      <div
                        className={`border  rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                          errors.referenceNumber ? 'border-red-500' : 'border-gray-500'
                        }`}
                      >
                        <input
                          type="text"
                          name="referenceNumber"
                          value={formData.referenceNumber}
                          onChange={handleChange}
                          placeholder="Enter reference number"
                          className="w-full h-10 px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                        />
                      </div>

                      {errors.referenceNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.referenceNumber}</p>
                      )}
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number 
                      </label>

                      <div
                        className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                          errors.contactNumber ? 'border-red-500' : 'border-gray-500'
                        }`}
                      >
                        <input
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          placeholder="Enter contact number"
                          className="w-full h-10 px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                        />
                      </div>

                      {errors.contactNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
                      )}
                    </div>

                  </div>
                </div>

                <div className="mt-6">

                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Second Reference
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Reference Number 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Name
                      </label>

                      <div
                        className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                          errors.referenceNumber2 ? 'border-red-500' : 'border-gray-500'
                        }`}
                      >
                        <input
                          type="text"
                          name="referenceNumber2"
                          value={formData.referenceNumber2}
                          onChange={handleChange}
                          placeholder="Enter reference number"
                          className="w-full h-10 px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                        />
                      </div>

                      {errors.referenceNumber2 && (
                        <p className="text-red-500 text-sm mt-1">{errors.referenceNumber2}</p>
                      )}
                    </div>

                    {/* Contact Number 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number 
                      </label>

                      <div
                        className={`border h-10 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                          errors.contactNumber2 ? 'border-red-500' : 'border-gray-500'
                        }`}
                      >
                        <input
                          type="tel"
                          name="contactNumber2"
                          value={formData.contactNumber2}
                          onChange={handleChange}
                          placeholder="Enter contact number"
                          maxLength={10}
                          className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                        />
                      </div>

                      {errors.contactNumber2 && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactNumber2}</p>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}



            {/* Step 2: Position Details */}

            
            {step === 2 && (
              <div>
                <div className="mt-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Academic Records
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Institution Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School / College Name <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.institution ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <input
                        type="text"
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                        placeholder="Enter school or college name"
                        className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                      />
                    </div>
                    {errors.institution && (
                      <p className="text-red-500 text-sm mt-1">{errors.institution}</p>
                    )}
                  </div>

                  {/* Board / University Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Board / University <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.boardType ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <select
                        name="boardType"
                        value={formData.boardType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                      >
                        <option value="">Select board / university type</option>
                        <option value="School">School</option>
                        <option value="University">University</option>
                      </select>
                    </div>
                    {errors.boardType && (
                      <p className="text-red-500 text-sm mt-1">{errors.boardType}</p>
                    )}
                  </div>

                  {/* Name of Board / University */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name of Board / University <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.boardName ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <input
                        type="text"
                        name="boardName"
                        value={formData.boardName}
                        onChange={handleChange}
                        placeholder="Enter board or university name"
                        className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                      />
                    </div>
                    {errors.boardName && (
                      <p className="text-red-500 text-sm mt-1">{errors.boardName}</p>
                    )}
                  </div>

                  {/* Examination Passed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Examination Passed <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.examPassed ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <input
                        type="text"
                        name="examPassed"
                        value={formData.examPassed}
                        onChange={handleChange}
                        placeholder="Enter exam passed"
                        className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                      />
                    </div>
                    {errors.examPassed && (
                      <p className="text-red-500 text-sm mt-1">{errors.examPassed}</p>
                    )}
                  </div>

                  {/* Year of Passing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Passing <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.yearOfPassing ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <select
                        name="yearOfPassing"
                        value={formData.yearOfPassing}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                      >
                        <option value="">Select year or pursuing</option>
                        <option value="Pursuing">Pursuing</option>
                        {Array.from({ length: 50 }, (_, i) => 1975 + i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.yearOfPassing && (
                      <p className="text-red-500 text-sm mt-1">{errors.yearOfPassing}</p>
                    )}
                  </div>

                  {/* Main Subjects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Main Subjects <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.mainSubjects ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <input
                        type="text"
                        name="mainSubjects"
                        value={formData.mainSubjects}
                        onChange={handleChange}
                        placeholder="Enter main subjects"
                        className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                      />
                    </div>
                    {errors.mainSubjects && (
                      <p className="text-red-500 text-sm mt-1">{errors.mainSubjects}</p>
                    )}
                  </div>

                  {/* Percentage / CGPA */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Percentage / CGPA <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.percentage ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <input
                        type="number"
                        name="percentage"
                        value={formData.percentage}
                        onChange={handleChange}
                        placeholder="Enter percentage or CGPA"
                        className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
                      />
                    </div>
                    {errors.percentage && (
                      <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>
                    )}
                  </div>

                </div>
              </div>



              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Position Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Applied For *
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
                        errors.position ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <option value="">Select a position</option>
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                    {errors.position && (
                      <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
                        errors.experience ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <option value="">Select experience</option>
                      <option value="fresher">Fresher (0 years)</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                    {errors.experience && (
                      <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Job Duration *
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* From Date */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        From
                      </label>
                      <textarea
                        name="experienceFromText"
                        value={formData.experienceFromText}
                        onChange={handleChange}
                        rows={2}
                        placeholder="e.g. Jan 2021"
                        className={`w-full h-10 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none transition ${
                          errors.experienceFromText ? 'border-red-500' : 'border-gray-500'
                        }`}
                      />
                      {errors.experienceFromText && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.experienceFromText}
                        </p>
                      )}
                    </div>

                    {/* To Date */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        To
                      </label>
                      <textarea
                        name="experienceToText"
                        value={formData.experienceToText}
                        onChange={handleChange}
                        rows={1}
                        placeholder="e.g. Mar 2024 / Present"
                        className={`w-full h-10 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none transition ${
                          errors.experienceToText ? 'border-red-500' : 'border-gray-500'
                        }`}
                      />
                      {errors.experienceToText && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.experienceToText}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Example: <span className="italic">Jan 2021 – Mar 2024</span> or <span className="italic">Present</span>
                  </p>
                </div>




                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Salary (Optional)
                  </label>
                  <input
                    type="text"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    className="w-full h-10 px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., $50,000 - $70,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Linkdin (Optional)
                  </label>
                  <input
                    type="url"
                    name="resumeLink"
                    value={formData.resumeLink}
                    onChange={handleChange}
                    className="w-full h-10 px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="linkdin profile..."
                  />
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Job Details
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Designation */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Designation *
                        </label>
                        <textarea
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          rows={2}
                          placeholder="e.g. Junior Software Developer"
                          className={`w-full h-10 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none transition ${
                            errors.designation ? 'border-red-500' : 'border-gray-500'
                          }`}
                        />
                        {errors.designation && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.designation}
                          </p>
                        )}
                      </div>

                      {/* Brief Job Profile */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Brief Job Profile *
                        </label>
                        <textarea
                          name="briefJobProfile"
                          value={formData.briefJobProfile}
                          onChange={handleChange}
                          rows={2}
                          placeholder="e.g. Worked on REST APIs and database integration"
                          className={`w-full h-10 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none transition ${
                            errors.briefJobProfile ? 'border-red-500' : 'border-gray-500'
                          }`}
                        />
                        {errors.briefJobProfile && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.briefJobProfile}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Skills (Learned in College)
                    </label>

                    <textarea
                      rows={2}
                      placeholder="Type a skill and press Enter (e.g. Data Structures)"
                      value={primarySkillInput}
                      onChange={(e) => setPrimarySkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const skill = primarySkillInput.trim();
                          if (skill && !formData.primarySkills.includes(skill)) {
                            setFormData((prev) => ({
                              ...prev,
                              primarySkills: [...prev.primarySkills, skill],
                            }));
                            setPrimarySkillInput('');
                          }
                        }
                      }}
                      className="w-full h-10 px-4 py-2 border border-gray-500 rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none"
                    />

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.primarySkills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                primarySkills: prev.primarySkills.filter((_, i) => i !== index),
                              }))
                            }
                            className="text-blue-500 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Skills (Applied in Work Experience)
                    </label>

                    <textarea
                      rows={2}
                      placeholder="Type a skill and press Enter (e.g. REST APIs)"
                      value={secondarySkillInput}
                      onChange={(e) => setSecondarySkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const skill = secondarySkillInput.trim();
                          if (skill && !formData.secondarySkills.includes(skill)) {
                            setFormData((prev) => ({
                              ...prev,
                              secondarySkills: [...prev.secondarySkills, skill],
                            }));
                            setSecondarySkillInput('');
                          }
                        }
                      }}
                      className="w-full h-10 px-4 py-2 border border-gray-500 rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none"
                    />

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.secondarySkills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                secondarySkills: prev.secondarySkills.filter((_, i) => i !== index),
                              }))
                            }
                            className="text-green-500 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>

                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
                        errors.experienceLevel ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Entry</option>
                      <option value="intermediate">mid-senior</option>
                      <option value="advanced">senior</option>
                      <option value="expert">lead</option>
                      <option value="expert">principle</option>
                    </select>

                    {errors.experienceLevel && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.experienceLevel}
                      </p>
                    )}
                  </div>






                </div>



                
              </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Your Information</h2>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Education</p>
                      <p className="font-semibold text-gray-900 capitalize">{formData.education.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-semibold text-gray-900">{formData.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-semibold text-gray-900 capitalize">{formData.experience} years</p>
                    </div>
                  </div>
                  
                  {formData.expectedSalary && (
                    <div>
                      <p className="text-sm text-gray-600">Expected Salary</p>
                      <p className="font-semibold text-gray-900">{formData.expectedSalary}</p>
                    </div>
                  )}
                  
                  {formData.resumeLink && (
                    <div>
                      <p className="text-sm text-gray-600">Resume Link</p>
                      <a href={formData.resumeLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                        View Resume
                      </a>
                    </div>
                  )}
                  
                  {formData.coverLetter && (
                    <div>
                      <p className="text-sm text-gray-600">Cover Letter</p>
                      <p className="text-gray-900">{formData.coverLetter}</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Next Step:</strong> After confirming your details, you'll proceed to the aptitude test. 
                    The test consists of 10 questions and you'll have 30 minutes to complete it.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Back
                </button>
              )}
              {step <= 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-8 py-3 bg-[#4A70A9] hover:bg-[#3F6296] 
           rounded-lg text-white font-medium 
           transform hover:-translate-y-0.5 hover:shadow-xl 
           transition-all duration-200"
                  >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-8 py-3 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 hover:shadow-lg transition transform hover:-translate-y-0.5"
                >
                  Confirm & Start Test
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
