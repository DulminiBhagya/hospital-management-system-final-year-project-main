import { useState, useEffect, useCallback } from "react";

// Add custom CSS animations
const customStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  .animation-delay-150 {
    animation-delay: 150ms;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

// Configuration constants
const CONFIG = {
  API_BASE: 'http://localhost:8080',
  TOKEN_KEY: 'adminToken'
};

// Doctor specializations
const SPECIALIZATIONS = [
  { value: 'NEPHROLOGY', label: 'Nephrology' },
  { value: 'DIALYSIS', label: 'Dialysis' },
  { value: 'TRANSPLANT', label: 'Transplant Surgery' },
  { value: 'INTERNAL_MEDICINE', label: 'Internal Medicine' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'UROLOGY', label: 'Urology' },
  { value: 'GENERAL_SURGERY', label: 'General Surgery' },
  { value: 'ANESTHESIOLOGY', label: 'Anesthesiology' },
  { value: 'PATHOLOGY', label: 'Pathology' },
  { value: 'RADIOLOGY', label: 'Radiology' }
];

// Department options
const DEPARTMENTS = [
  { value: 'NEPHROLOGY', label: 'Nephrology Department' },
  { value: 'DIALYSIS_UNIT', label: 'Dialysis Unit' },
  { value: 'TRANSPLANT_UNIT', label: 'Transplant Unit' },
  { value: 'ICU', label: 'Intensive Care Unit' },
  { value: 'GENERAL_WARD', label: 'General Ward' },
  { value: 'OUTPATIENT', label: 'Outpatient Department' },
  { value: 'EMERGENCY', label: 'Emergency Department' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'RADIOLOGY', label: 'Radiology Department' }
];

// Toast notification types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Utility functions
const getFromStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('localStorage not available:', error);
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

const getErrorMessage = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;
  
  switch (status) {
    case 401:
      return "Session expired. Please login again.";
    case 403:
      return "Insufficient permissions to perform this action.";
    case 409:
      return "Doctor already exists with this Employee ID, Email, or License Number.";
    case 422:
      return "Invalid input data. Please check all fields.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return message || "An unexpected error occurred. Please try again.";
  }
};

// Toast Component
const Toast = ({ toast, onClose }) => {
  const getToastStyles = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-white border-l-4 border-green-500 shadow-lg';
      case TOAST_TYPES.ERROR:
        return 'bg-white border-l-4 border-red-500 shadow-lg';
      case TOAST_TYPES.WARNING:
        return 'bg-white border-l-4 border-yellow-500 shadow-lg';
      case TOAST_TYPES.INFO:
        return 'bg-white border-l-4 border-blue-500 shadow-lg';
      default:
        return 'bg-white border-l-4 border-gray-500 shadow-lg';
    }
  };

  const getToastIcon = (type) => {
    const baseClasses = "w-5 h-5";
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className={`${baseClasses} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case TOAST_TYPES.ERROR:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className={`${baseClasses} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case TOAST_TYPES.WARNING:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className={`${baseClasses} text-yellow-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div className={`max-w-sm w-full rounded-xl overflow-hidden transform transition-all duration-500 ease-out hover:scale-105 ${getToastStyles(toast.type)} animate-in slide-in-from-right-full`}>
      <div className="p-5">
        <div className="flex items-start">
          <div className="relative">
            {getToastIcon(toast.type)}
          </div>
          <div className="ml-4 w-0 flex-1">
            {toast.title && (
              <p className="text-sm font-bold text-gray-900 mb-2 tracking-wide">
                {toast.title}
              </p>
            )}
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onClose(toast.id)}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 hover:scale-110"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * -8}px)`,
            zIndex: 50 - index
          }}
        >
          <Toast
            toast={toast}
            onClose={onRemoveToast}
          />
        </div>
      ))}
    </div>
  );
};

export default function DoctorManagement() {
  // State management
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  useEffect(() => {
    if (fetchError) {
      showError(fetchError);
    }
  }, [fetchError, showError]);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [newDoctor, setNewDoctor] = useState({
    empId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    specialization: "",
    department: "",
    yearsOfExperience: "",
    qualification: "",
    address: "",
    dateOfBirth: "",
    emergencyContact: "",
    bloodGroup: "",
    joiningDate: ""
  });
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Toast functions
  const addToast = useCallback((message, type = TOAST_TYPES.INFO, title = null, duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, title, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    addToast(message, TOAST_TYPES.SUCCESS, title);
  }, [addToast]);

  const showError = useCallback((message, title = 'Error') => {
    addToast(message, TOAST_TYPES.ERROR, title);
  }, [addToast]);

  // API functions
  const makeApiCall = useCallback(async (method, endpoint, data = null) => {
    const token = getFromStorage(CONFIG.TOKEN_KEY);
    
    if (!token || isTokenExpired(token)) {
      throw new Error('Session expired. Please login again.');
    }

    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const url = `${CONFIG.API_BASE}${endpoint}`;
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Handle HTTP errors
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP ${response.status}`;
      } catch {
        errorMessage = `HTTP ${response.status} - ${response.statusText}`;
      }
      
      const error = new Error(errorMessage);
      error.response = {
        status: response.status,
        data: { message: errorMessage }
      };
      throw error;
    }

    return await response.json();
  }, []);

  const fetchDoctors = useCallback(async () => {
    setIsLoadingDoctors(true);
    setFetchError(null);

    try {
      const response = await makeApiCall('GET', '/api/doctors');

      // Handle HMS CommonResponseDTO structure
      if (response.success) {
        setDoctors(response.data.data || []);
      } else {
        setFetchError(response.message || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error("Failed to fetch doctors", error);
      setFetchError(getErrorMessage(error));
    } finally {
      setIsLoadingDoctors(false);
    }
  }, [makeApiCall]);

  // Form validation
  const validateForm = (doctorData) => {
    const errors = {};
    
    if (!doctorData.empId?.trim()) {
      errors.empId = "Employee ID is required";
    }
    
    if (!doctorData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }
    
    if (!doctorData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }
    
    if (!doctorData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(doctorData.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!doctorData.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(doctorData.phone)) {
      errors.phone = "Phone number is invalid";
    }
    
    if (!doctorData.licenseNumber?.trim()) {
      errors.licenseNumber = "License number is required";
    }
    
    if (!doctorData.specialization?.trim()) {
      errors.specialization = "Specialization is required";
    }
    
    if (!doctorData.department?.trim()) {
      errors.department = "Department is required";
    }
    
    if (!doctorData.yearsOfExperience?.trim()) {
      errors.yearsOfExperience = "Years of experience is required";
    } else if (isNaN(doctorData.yearsOfExperience) || doctorData.yearsOfExperience < 0) {
      errors.yearsOfExperience = "Years of experience must be a valid number";
    }
    
    if (!doctorData.qualification?.trim()) {
      errors.qualification = "Qualification is required";
    }
    
    if (!doctorData.dateOfBirth?.trim()) {
      errors.dateOfBirth = "Date of birth is required";
    }
    
    if (!doctorData.joiningDate?.trim()) {
      errors.joiningDate = "Joining date is required";
    }
    
    return errors;
  };

  // Event handlers
  const handleCreateDoctor = async () => {
    const errors = validateForm(newDoctor);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const doctorData = {
        ...newDoctor,
        yearsOfExperience: parseInt(newDoctor.yearsOfExperience)
      };

      const response = await makeApiCall('POST', '/api/doctors', doctorData);

      // Handle HMS CommonResponseDTO structure
      if (response.success) {
        setNewDoctor({
          empId: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          licenseNumber: "",
          specialization: "",
          department: "",
          yearsOfExperience: "",
          qualification: "",
          address: "",
          dateOfBirth: "",
          emergencyContact: "",
          bloodGroup: "",
          joiningDate: ""
        });
        setIsCreateModalOpen(false);
        setValidationErrors({});
        await fetchDoctors();
        
        showSuccess('Doctor created successfully!', 'Doctor Created');
      } else {
        setValidationErrors({ general: response.message || "Failed to create doctor" });
      }
    } catch (error) {
      console.error(error);
      setValidationErrors({ general: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor({
      ...doctor,
      dateOfBirth: doctor.dateOfBirth ? doctor.dateOfBirth.split('T')[0] : '',
      joiningDate: doctor.joiningDate ? doctor.joiningDate.split('T')[0] : ''
    });
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  const handleUpdateDoctor = async () => {
    const errors = validateForm(editingDoctor);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const doctorData = {
        ...editingDoctor,
        yearsOfExperience: parseInt(editingDoctor.yearsOfExperience)
      };

      const response = await makeApiCall(
        'PUT',
        `/api/doctors/${editingDoctor.id}`,
        doctorData
      );

      // Handle HMS CommonResponseDTO structure
      if (response.success) {
        setIsEditModalOpen(false);
        setEditingDoctor(null);
        setValidationErrors({});
        await fetchDoctors();
        showSuccess('Doctor updated successfully!', 'Doctor Updated');
      } else {
        setValidationErrors({ general: response.message || "Failed to update doctor" });
      }
    } catch (error) {
      console.error(error);
      setValidationErrors({ general: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctorName}? This action cannot be undone.`)) {
      try {
        const response = await makeApiCall('DELETE', `/api/doctors/${doctorId}`);

        // Handle HMS CommonResponseDTO structure
        if (response.success) {
          setDoctors(doctors.filter((doctor) => doctor.id !== doctorId));
          showSuccess(`Dr. ${doctorName} deleted successfully!`, 'Doctor Deleted');
        } else {
          showError(response.message || "Failed to delete doctor", 'Delete Failed');
        }
      } catch (error) {
        console.error("Delete doctor error:", error);
        showError(getErrorMessage(error), 'Delete Failed');
      }
    }
  };

  // Filter doctors based on search term and filters
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm || 
      doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter;
    const matchesDepartment = !departmentFilter || doctor.department === departmentFilter;
    
    return matchesSearch && matchesSpecialization && matchesDepartment;
  });

  // Initialize component
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
        }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b-2 border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-xl blur-md"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <svg className="w-9 h-9 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Doctor Management</h1>
                  <p className="text-gray-600 text-sm font-medium mt-1">National Institute of Nephrology, Dialysis and Transplantation</p>
                  <div className="flex items-center mt-2 text-gray-500 text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              {/* Statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Total Doctors', value: filteredDoctors.length, color: 'bg-white border border-gray-200 text-gray-800 shadow-sm', icon: '👨‍⚕️' },
                  { label: 'Nephrology', value: filteredDoctors.filter(d => d.specialization === 'NEPHROLOGY').length, color: 'bg-blue-50 border border-blue-200 text-blue-800 shadow-sm', icon: '🫀' },
                  { label: 'Dialysis', value: filteredDoctors.filter(d => d.specialization === 'DIALYSIS').length, color: 'bg-green-50 border border-green-200 text-green-800 shadow-sm', icon: '⚕️' }
                ].map((stat) => (
                  <div key={stat.label} className="group relative">
                    <div className="absolute inset-0 bg-white opacity-10 rounded-lg blur-sm group-hover:opacity-20 transition-opacity"></div>
                    <div className={`relative ${stat.color} rounded-lg px-4 py-3 text-center hover:scale-105 transition-all duration-200`}>
                      <div className="text-lg font-bold">{isLoadingDoctors ? '...' : stat.value}</div>
                      <div className="text-xs font-medium mt-1">{stat.label}</div>
                      <div className="absolute top-1 right-2 text-lg opacity-60">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search doctors by name, ID, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 w-80 shadow-sm"
                    />
                  </div>

                  {/* Specialization Filter */}
                  <div className="relative">
                    <select
                      value={specializationFilter}
                      onChange={(e) => setSpecializationFilter(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm font-medium"
                    >
                      <option value="">All Specializations</option>
                      {SPECIALIZATIONS.map(spec => (
                        <option key={spec.value} value={spec.value}>{spec.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div className="relative">
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm font-medium"
                    >
                      <option value="">All Departments</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={fetchDoctors}
                    disabled={isLoadingDoctors}
                    className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-3 px-5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                  >
                    <svg className={`w-4 h-4 ${isLoadingDoctors ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Doctor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Doctors Table */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm opacity-60">👨‍⚕️</span>
                          <span>Doctor</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm opacity-60">🆔</span>
                          <span>Employee ID</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm opacity-60">🏥</span>
                          <span>Specialization</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm opacity-60">🏢</span>
                          <span>Department</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm opacity-60">📞</span>
                          <span>Contact</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <span className="flex items-center justify-end space-x-1">
                          <span>⚙️</span>
                          <span>Actions</span>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {isLoadingDoctors ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xl font-semibold text-gray-700">Loading doctors...</p>
                              <p className="text-sm text-gray-500">Please wait while we fetch the latest data</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50 transition-all duration-200 group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm transition-shadow">
                                  <span className="text-white font-bold text-sm">
                                    {doctor.firstName[0]}{doctor.lastName[0]}
                                  </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{doctor.qualification}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900 font-mono">{doctor.empId}</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="inline-flex items-center">
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full border-2 bg-blue-100 text-blue-800 border-blue-200 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-current opacity-60 mr-2"></span>
                                {SPECIALIZATIONS.find(s => s.value === doctor.specialization)?.label || doctor.specialization}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {DEPARTMENTS.find(d => d.value === doctor.department)?.label || doctor.department}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doctor.email}</div>
                            <div className="text-xs text-gray-500">{doctor.phone}</div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditDoctor(doctor)}
                                className="group/btn relative inline-flex items-center justify-center w-10 h-10 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-500 rounded-xl transition-all duration-200 border-2 border-blue-200 hover:border-blue-500 shadow-sm hover:shadow-blue-200 transform hover:scale-105"
                                title="Edit doctor"
                              >
                                <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteDoctor(doctor.id, `${doctor.firstName} ${doctor.lastName}`)}
                                className="group/btn relative inline-flex items-center justify-center w-10 h-10 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-500 shadow-sm hover:shadow-red-200 transform hover:scale-105"
                                title="Delete doctor"
                              >
                                <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-20">
                          <div className="flex flex-col items-center space-y-6">
                            <div className="relative">
                              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">🔍</span>
                              </div>
                            </div>
                            <div className="text-center space-y-3">
                              <p className="text-xl font-bold text-gray-700">
                                {searchTerm || specializationFilter || departmentFilter ? 'No doctors match your filters' : 'No doctors found'}
                              </p>
                              <p className="text-gray-500 max-w-md">
                                {searchTerm || specializationFilter || departmentFilter ? 'Try adjusting your search criteria or clear the filters to see all doctors.' : 'Get started by adding your first doctor to the hospital staff.'}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              {(searchTerm || specializationFilter || departmentFilter) && (
                                <button
                                  onClick={() => {
                                    setSearchTerm('');
                                    setSpecializationFilter('');
                                    setDepartmentFilter('');
                                  }}
                                  className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium border border-blue-200"
                                >
                                  Clear all filters
                                </button>
                              )}
                              <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-blue-200 transform hover:scale-105"
                              >
                                Add your first doctor
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Create Doctor Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-200 transform animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 px-8 py-6 rounded-t-3xl flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Add New Doctor</h3>
                    <p className="text-blue-100 text-sm">Add a new doctor to the hospital staff</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewDoctor({
                      empId: "",
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      licenseNumber: "",
                      specialization: "",
                      department: "",
                      yearsOfExperience: "",
                      qualification: "",
                      address: "",
                      dateOfBirth: "",
                      emergencyContact: "",
                      bloodGroup: "",
                      joiningDate: ""
                    });
                    setValidationErrors({});
                  }}
                  className="text-white hover:text-gray-200 transition-colors hover:bg-white hover:bg-opacity-10 rounded-xl p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateDoctor(); }} className="p-8 space-y-8">
                {/* General Error */}
                {validationErrors.general && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-red-800">Error</p>
                        <p className="text-sm text-red-700">{validationErrors.general}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Information Section */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <span className="mr-2">👤</span>
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employee ID */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800 flex items-center space-x-1">
                        <span>🆔</span>
                        <span>Employee ID</span>
                        <span className="text-red-500 text-xs">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., DOC-2024-001"
                        value={newDoctor.empId}
                        onChange={(e) => setNewDoctor({ ...newDoctor, empId: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 font-mono ${
                          validationErrors.empId ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.empId && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{validationErrors.empId}</span>
                        </p>
                      )}
                    </div>

                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={newDoctor.firstName}
                        onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.firstName ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.firstName && (
                        <p className="text-sm text-red-600">{validationErrors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={newDoctor.lastName}
                        onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.lastName ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.lastName && (
                        <p className="text-sm text-red-600">{validationErrors.lastName}</p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newDoctor.dateOfBirth}
                        onChange={(e) => setNewDoctor({ ...newDoctor, dateOfBirth: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.dateOfBirth ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.dateOfBirth && (
                        <p className="text-sm text-red-600">{validationErrors.dateOfBirth}</p>
                      )}
                    </div>

                    {/* Blood Group */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">Blood Group</label>
                      <select
                        value={newDoctor.bloodGroup}
                        onChange={(e) => setNewDoctor({ ...newDoctor, bloodGroup: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 border-gray-200 focus:ring-blue-500 hover:border-gray-300"
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-bold text-gray-800">Address</label>
                      <textarea
                        placeholder="Enter complete address"
                        value={newDoctor.address}
                        onChange={(e) => setNewDoctor({ ...newDoctor, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 border-gray-200 focus:ring-blue-500 hover:border-gray-300 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <span className="mr-2">📞</span>
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="doctor@hospital.com"
                        value={newDoctor.email}
                        onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.email ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-red-600">{validationErrors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+94 77 123 4567"
                        value={newDoctor.phone}
                        onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.phone ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.phone && (
                        <p className="text-sm text-red-600">{validationErrors.phone}</p>
                      )}
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-bold text-gray-800">Emergency Contact</label>
                      <input
                        type="tel"
                        placeholder="Emergency contact number"
                        value={newDoctor.emergencyContact}
                        onChange={(e) => setNewDoctor({ ...newDoctor, emergencyContact: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 border-gray-200 focus:ring-blue-500 hover:border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="bg-green-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <span className="mr-2">🎓</span>
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* License Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Medical License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., SLMC-12345"
                        value={newDoctor.licenseNumber}
                        onChange={(e) => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 font-mono ${
                          validationErrors.licenseNumber ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.licenseNumber && (
                        <p className="text-sm text-red-600">{validationErrors.licenseNumber}</p>
                      )}
                    </div>

                    {/* Specialization */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Specialization <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newDoctor.specialization}
                        onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.specialization ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Select specialization</option>
                        {SPECIALIZATIONS.map(spec => (
                          <option key={spec.value} value={spec.value}>{spec.label}</option>
                        ))}
                      </select>
                      {validationErrors.specialization && (
                        <p className="text-sm text-red-600">{validationErrors.specialization}</p>
                      )}
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newDoctor.department}
                        onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.department ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Select department</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept.value} value={dept.value}>{dept.label}</option>
                        ))}
                      </select>
                      {validationErrors.department && (
                        <p className="text-sm text-red-600">{validationErrors.department}</p>
                      )}
                    </div>

                    {/* Years of Experience */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Years of Experience <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="e.g., 5"
                        value={newDoctor.yearsOfExperience}
                        onChange={(e) => setNewDoctor({ ...newDoctor, yearsOfExperience: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.yearsOfExperience ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.yearsOfExperience && (
                        <p className="text-sm text-red-600">{validationErrors.yearsOfExperience}</p>
                      )}
                    </div>

                    {/* Qualification */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Qualification <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., MBBS, MD (Nephrology)"
                        value={newDoctor.qualification}
                        onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.qualification ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.qualification && (
                        <p className="text-sm text-red-600">{validationErrors.qualification}</p>
                      )}
                    </div>

                    {/* Joining Date */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">
                        Joining Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newDoctor.joiningDate}
                        onChange={(e) => setNewDoctor({ ...newDoctor, joiningDate: e.target.value })}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          validationErrors.joiningDate ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {validationErrors.joiningDate && (
                        <p className="text-sm text-red-600">{validationErrors.joiningDate}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setNewDoctor({
                        empId: "",
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        licenseNumber: "",
                        specialization: "",
                        department: "",
                        yearsOfExperience: "",
                        qualification: "",
                        address: "",
                        dateOfBirth: "",
                        emergencyContact: "",
                        bloodGroup: "",
                        joiningDate: ""
                      });
                      setValidationErrors({});
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>{isLoading ? 'Creating Doctor...' : 'Add Doctor'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Doctor Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">Edit Doctor</h2>
                {/* Add form fields similar to create modal */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateDoctor}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg"
                  >
                    Update Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}