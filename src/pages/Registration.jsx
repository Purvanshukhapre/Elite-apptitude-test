import { useState } from 'react';
<<<<<<< Updated upstream
import logo from "../assets/elitelogo.png";
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { positions } from '../data/questions';

=======
>>>>>>> Stashed changes

const Registration = () => {
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
<<<<<<< Updated upstream
    countryCode: '+91',
=======
>>>>>>> Stashed changes
    email: '',
    countryCode: '+91',
    phone: '',
    education: '',
    languages: '',
    address: '',
<<<<<<< Updated upstream
    experience: '',
=======
    pincode: '',
    referenceNumber: '',
    contactNumber: '',
    referenceNumber2: '',
    contactNumber2: '',
    institution: '',
    boardType: '',
    boardName: '',
    examPassed: '',
    yearOfPassing: '',
    mainSubjects: '',
    percentage: '',
>>>>>>> Stashed changes
    position: '',
    experience: '',
    expectedSalary: '',
    resumeLink: '',
    coverLetter: '',
    experienceLevel: '',
    primarySkills: [],
    secondarySkills: [],
  });
  const [errors, setErrors] = useState({});

  const positions = [
    'Software Engineer',
    'Data Analyst',
    'Product Manager',
    'UX Designer',
    'Marketing Manager',
    'Sales Executive'
  ];

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
<<<<<<< Updated upstream
    if (!formData.fatherName.trim())
    newErrors.fatherName = 'Father name is required';

=======
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
>>>>>>> Stashed changes
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
    if (!formData.languages.trim()) newErrors.languages = 'Languages known is required';
    
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
<<<<<<< Updated upstream
    try {
      const applicant = await addApplicant(formData);
      setCurrentApplicant(applicant);
      navigate('/test');
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
=======
    alert('Registration Complete! Proceeding to test...');
>>>>>>> Stashed changes
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
<<<<<<< Updated upstream
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
                    {s === 1 && "Personal Info"}
                    {s === 2 && "Position Details"}
                    {s === 3 && "Review"}
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
=======
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            Elite Associate
          </h1>
          <p className="text-gray-600 text-lg">Join our team of exceptional professionals</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Personal Info' },
              { num: 2, label: 'Professional' },
              { num: 3, label: 'Review' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      step >= s.num
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                        : 'bg-white text-gray-400 border-2 border-gray-300'
>>>>>>> Stashed changes
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                    step > s.num ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-gray-100">
                  Personal Information
                </h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex items-stretch border-2 rounded-xl overflow-hidden transition-all ${
                    errors.fullName ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500'
                  }`}>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="px-4 bg-gray-50 border-r-2 border-gray-200 outline-none text-gray-700 font-medium"
                    >
                      <option value="Mr">Mr.</option>
                      <option value="Miss">Miss</option>
                      <option value="Mrs">Mrs.</option>
                    </select>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
<<<<<<< Updated upstream
                      placeholder="Name"
                      className="w-full px-3 bg-transparent outline-none border-none"
=======
                      placeholder="Enter your full name"
                      className="flex-1 px-4 py-3 outline-none"
>>>>>>> Stashed changes
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
<<<<<<< Updated upstream

                  <div
                    className={`flex h-10 items-center border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                      errors.fatherName ? 'border-red-500' : 'border-gray-500'
=======
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${
                      errors.fatherName ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
>>>>>>> Stashed changes
                    }`}
                  />
                  {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth
                    </label>
<<<<<<< Updated upstream

                    <div
                      className={`flex h-10 items-center border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.dob ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
                      {/* Age box */}
=======
                    <div className="flex items-stretch border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500">
>>>>>>> Stashed changes
                      <input
                        type="text"
                        value={formData.age || ''}
                        readOnly
                        placeholder="Age"
<<<<<<< Updated upstream
                        className="w-20 h-9 px-3 bg-gray-100 text-gray-600 outline-none border-none cursor-not-allowed rounded-l-lg"
                      />

                      {/* Date picker */}
=======
                        className="w-16 px-3 bg-gray-50 text-center text-gray-600 font-medium border-r-2 border-gray-200"
                      />
>>>>>>> Stashed changes
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={(e) => {
<<<<<<< Updated upstream
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
=======
                          handleChange(e);
                          if (e.target.value) {
                            const age = calculateAge(e.target.value);
                            setFormData(prev => ({ ...prev, age: age.toString() }));
                          }
                        }}
                        className="flex-1 px-4 py-3 outline-none"
>>>>>>> Stashed changes
                      />

                    </div>
                  </div>

<<<<<<< Updated upstream


                  <div className="mt-4 pl-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Marital Status <span className="text-red-500">*</span>
=======
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Marital Status
>>>>>>> Stashed changes
                    </label>
                    <div className="flex gap-4 pt-2">
                      {['Single', 'Married', 'Divorced'].map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="maritalStatus"
                            value={status}
                            checked={formData.maritalStatus === status}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <div className="flex gap-6 pt-2">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <label key={gender} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={formData.gender === gender}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
<<<<<<< Updated upstream
                      className={`w-full h-10 px-4 py-3 rounded-lg border border-gray-200
                        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
                        transition ${
                        errors.email ? 'border-red-500' : 'border-gray-500'
=======
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${
                        errors.email ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
>>>>>>> Stashed changes
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
<<<<<<< Updated upstream

                    <div
                      className={`flex h-10 items-center border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.phone ? 'border-red-500' : 'border-gray-500'
                      }`}
                    >
=======
                    <div className={`flex items-stretch border-2 rounded-xl overflow-hidden transition-all ${
                      errors.phone ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500'
                    }`}>
>>>>>>> Stashed changes
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
<<<<<<< Updated upstream
                        className="h-9 px-3 bg-transparent text-gray-700 border-none outline-none rounded-l-lg"
=======
                        className="px-3 bg-gray-50 border-r-2 border-gray-200 outline-none"
>>>>>>> Stashed changes
                      >
                        <option value="+1">+1</option>
                        <option value="+91">+91</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="flex-1 px-4 py-3 outline-none"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Highest Education <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
<<<<<<< Updated upstream
                    className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
                      errors.education ? 'border-red-500' : 'border-gray-500'
=======
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${
                      errors.education ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
>>>>>>> Stashed changes
                    }`}
                  >
                    <option value="" >
                      Select your education
                    </option>
                    <option value="high-school">High School</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>

                  {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Languages Known <span className="text-red-500">*</span>
                  </label>
<<<<<<< Updated upstream

                  <div
                    className={`border h-10 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                      errors.languages ? 'border-red-500' : 'border-gray-500'
=======
                  <textarea
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="e.g., English, Hindi, Tamil"
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all resize-none ${
                      errors.languages ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
>>>>>>> Stashed changes
                    }`}
                  />
                  {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
                </div>

<<<<<<< Updated upstream

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>

                  <div
                    className={`border h-10 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                      errors.address ? 'border-red-500' : 'border-gray-500'
                    }`}
                  >
=======
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
>>>>>>> Stashed changes
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

<<<<<<< Updated upstream
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
=======
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pincode
                    </label>
>>>>>>> Stashed changes
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) handleChange(e);
                      }}
                      placeholder="Enter pincode"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                  <h3 className="text-lg font-bold text-gray-800">References (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                      placeholder="Reference 1 Name"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Contact Number"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<<<<<<< Updated upstream

                    {/* Reference Number */}
                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Number
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
                        Reference Number 
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

=======
                    <input
                      type="text"
                      name="referenceNumber2"
                      value={formData.referenceNumber2}
                      onChange={handleChange}
                      placeholder="Reference 2 Name"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                    <input
                      type="tel"
                      name="contactNumber2"
                      value={formData.contactNumber2}
                      onChange={handleChange}
                      placeholder="Contact Number"
                      maxLength={10}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
>>>>>>> Stashed changes
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-gray-100">
                  Professional Details
                </h2>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Academic Records</h3>

<<<<<<< Updated upstream
                  {/* Institution Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School / College Name <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.institution ? 'border-red-500' : 'border-gray-500'
                      }`}
=======
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="School / College Name"
                      className="px-4 py-3 border-2 border-white rounded-xl outline-none focus:border-blue-500 bg-white"
                    />

                    <select
                      name="boardType"
                      value={formData.boardType}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-white rounded-xl outline-none focus:border-blue-500 bg-white"
>>>>>>> Stashed changes
                    >
                      <option value="">Board / University Type</option>
                      <option value="School">School</option>
                      <option value="University">University</option>
                    </select>

<<<<<<< Updated upstream
                  {/* Board / University Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Board / University <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                        errors.boardType ? 'border-red-500' : 'border-gray-500'
                      }`}
=======
                    <input
                      type="text"
                      name="boardName"
                      value={formData.boardName}
                      onChange={handleChange}
                      placeholder="Board / University Name"
                      className="px-4 py-3 border-2 border-white rounded-xl outline-none focus:border-blue-500 bg-white"
                    />

                    <input
                      type="text"
                      name="examPassed"
                      value={formData.examPassed}
                      onChange={handleChange}
                      placeholder="Examination Passed"
                      className="px-4 py-3 border-2 border-white rounded-xl outline-none focus:border-blue-500 bg-white"
                    />

                    <select
                      name="yearOfPassing"
                      value={formData.yearOfPassing}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-white rounded-xl outline-none focus:border-blue-500 bg-white"
>>>>>>> Stashed changes
                    >
                      <option value="">Year of Passing</option>
                      <option value="Pursuing">Pursuing</option>
                      {Array.from({ length: 50 }, (_, i) => 2024 - i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="mainSubjects"
                      value={formData.mainSubjects}
                      onChange={handleChange}
                      placeholder="Main Subjects"
                      className="px-4 py-3 border-2 border-white rounded-xl outline-none focus:border-blue-500 bg-white"
                    />

                    <input
                      type="number"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleChange}
                      placeholder="Percentage / CGPA"
                      className="px-4 py-3 border-2 border-white rounded-xl outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
<<<<<<< Updated upstream

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
=======
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position Applied For <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${
                        errors.position ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    >
                      <option value="">Select a position</option>
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                    {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${
                        errors.experience ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
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
                    {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Salary (Optional)
                    </label>
                    <input
                      type="text"
                      name="expectedSalary"
                      value={formData.expectedSalary}
                      onChange={handleChange}
                      placeholder="e.g., ₹50,000 - ₹70,000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      name="resumeLink"
                      value={formData.resumeLink}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
>>>>>>> Stashed changes
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-gray-100">
                  Review Your Information
                </h2>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', value: `${formData.title} ${formData.fullName}` },
                      { label: 'Email', value: formData.email },
                      { label: 'Phone', value: `${formData.countryCode} ${formData.phone}` },
                      { label: 'Education', value: formData.education },
                      { label: 'Position', value: formData.position },
                      { label: 'Experience', value: formData.experience }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                        <p className="font-semibold text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-100 border-2 border-blue-300 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">ℹ</span>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-2">Next Step: Aptitude Test</p>
                      <p className="text-blue-800 text-sm">
                        After confirming your details, you will proceed to the aptitude test with 10 questions. 
                        You will have 30 minutes to complete it. Good luck!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-10 pt-8 border-t-2 border-gray-100">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
<<<<<<< Updated upstream
                  className="ml-auto px-8 py-3 bg-[#4A70A9] hover:bg-[#3F6296] 
           rounded-lg text-white font-medium 
           transform hover:-translate-y-0.5 hover:shadow-xl 
           transition-all duration-200"
                  >
                  Next
=======
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Continue
>>>>>>> Stashed changes
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Confirm and Start Test
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