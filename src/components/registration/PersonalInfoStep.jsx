import { useState } from 'react';

const PersonalInfoStep = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDOBChange = (e) => {
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
  };

  return (
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
            value={formData.title || 'Mr'}
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
            value={formData.fullName || ''}
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
            value={formData.fatherName || ''}
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
              value={formData.dob || ''}
              onChange={handleDOBChange}
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
            value={formData.email || ''}
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
              value={formData.countryCode || '+91'}
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
              value={formData.phone || ''}
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
          value={formData.education || ''}
          onChange={handleChange}
          className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
            errors.education ? 'border-red-500' : 'border-gray-500'
          }`}
        >
          <option value="" >
            Select your education
          </option>
          <option value="high-school">High School</option>
          <option value="associate">Associate Degree</option>
          <option value="bachelor">Bachelor's Degree</option>
          <option value="master">Master's Degree</option>
          <option value="phd">PhD</option>
        </select>

        {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
      </div>

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
            value={formData.languages || ''}
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
            value={formData.address || ''}
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
            value={formData.pincode || ''}
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
          First Reference (Optional)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={formData.referenceNumber || ''}
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
                value={formData.contactNumber || ''}
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
                value={formData.referenceNumber2 || ''}
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
                value={formData.contactNumber2 || ''}
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
  );
};

export default PersonalInfoStep;