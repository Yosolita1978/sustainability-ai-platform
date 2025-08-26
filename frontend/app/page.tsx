// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    industry_focus: '',      // ← Changed from 'industry' to 'industry_focus'
    regulatory_framework: '',
    training_level: '',
    company_name: ''         // ← Keep for display, but don't send to backend
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [name]: 'This field is required' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const fields = ['company_name', 'industry_focus', 'regulatory_framework', 'training_level'];
    let isValid = true;
    
    fields.forEach(field => {
      const fieldValue = formData[field as keyof typeof formData];
      if (!validateField(field, fieldValue)) {
        isValid = false;
      }
    });

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    // Prepare data for backend - exclude company_name as backend doesn't expect it
    const backendData = {
      industry_focus: formData.industry_focus,
      regulatory_framework: formData.regulatory_framework,
      training_level: formData.training_level
    };

    // Debug: Log the data being sent
    console.log('Sending data to backend:', JSON.stringify(backendData, null, 2));

    try {
      const response = await fetch('http://localhost:8000/api/training/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to start training: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      router.push(`/progress?id=${result.session_id}`); // ← Note: session_id not id
    } catch (error) {
      console.error('Error starting training:', error);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const isFormValid = formData.industry_focus && formData.regulatory_framework && 
                     formData.training_level && formData.company_name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Sustainability Training
          </h1>
          <p className="text-gray-600">
            Generate customized sustainability messaging training for your organization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 font-medium text-base placeholder-blue-300 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.company_name 
                  ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
              }`}
              placeholder="Enter your company name"
              required
            />
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.company_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="industry_focus" className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <select
              id="industry_focus"
              name="industry_focus"
              value={formData.industry_focus}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 font-medium text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.industry_focus 
                  ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
              } ${!formData.industry_focus ? 'text-blue-300' : ''}`}
              required
            >
              <option value="" className="text-blue-300">Select your industry</option>
              <option value="Technology" className="text-gray-900">Technology</option>
              <option value="Manufacturing" className="text-gray-900">Manufacturing</option>
              <option value="Finance" className="text-gray-900">Finance & Banking</option>
              <option value="Retail" className="text-gray-900">Retail & Consumer Goods</option>
              <option value="Healthcare" className="text-gray-900">Healthcare</option>
              <option value="Energy" className="text-gray-900">Energy & Utilities</option>
              <option value="Transportation" className="text-gray-900">Transportation & Logistics</option>
              <option value="Construction" className="text-gray-900">Construction & Real Estate</option>
              <option value="Agriculture" className="text-gray-900">Agriculture & Food</option>
              <option value="Consulting" className="text-gray-900">Consulting & Professional Services</option>
            </select>
            {errors.industry_focus && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.industry_focus}</p>
            )}
          </div>

          <div>
            <label htmlFor="regulatory_framework" className="block text-sm font-medium text-gray-700 mb-2">
              Regulatory Framework
            </label>
            <select
              id="regulatory_framework"
              name="regulatory_framework"
              value={formData.regulatory_framework}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 font-medium text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.regulatory_framework 
                  ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
              } ${!formData.regulatory_framework ? 'text-blue-300' : ''}`}
              required
            >
              <option value="" className="text-blue-300">Select regulatory framework</option>
              <option value="EU" className="text-gray-900">EU Corporate Sustainability Reporting Directive (CSRD)</option>
              <option value="USA" className="text-gray-900">SEC Climate Disclosure Rules</option>
              <option value="UK" className="text-gray-900">UK Sustainability Disclosure Requirements</option>
              <option value="Global" className="text-gray-900">Global Standards (TCFD, GRI, SASB)</option>
            </select>
            {errors.regulatory_framework && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.regulatory_framework}</p>
            )}
          </div>

          <div>
            <label htmlFor="training_level" className="block text-sm font-medium text-gray-700 mb-2">
              Training Level
            </label>
            <select
              id="training_level"
              name="training_level"
              value={formData.training_level}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 font-medium text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.training_level 
                  ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
              } ${!formData.training_level ? 'text-blue-300' : ''}`}
              required
            >
              <option value="" className="text-blue-300">Select training level</option>
              <option value="Beginner" className="text-gray-900">Beginner - Introduction to sustainability messaging</option>
              <option value="Intermediate" className="text-gray-900">Intermediate - Comprehensive training for teams</option>
              <option value="Advanced" className="text-gray-900">Advanced - Expert-level training for leaders</option>
            </select>
            {errors.training_level && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.training_level}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? 'Generating Training...' : 'Generate Custom Training'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Training generation typically takes 2-3 minutes</p>
        </div>
      </div>
    </div>
  );
}