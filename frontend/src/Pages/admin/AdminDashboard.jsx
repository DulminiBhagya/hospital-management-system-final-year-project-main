import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

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

// Toast notification types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Configuration constants
const CONFIG = {
  API_BASE: 'http://localhost:8080', // In production, this would come from environment variables
  ITEMS_PER_PAGE: 10,
  DEBOUNCE_DELAY: 300,
  TOKEN_KEY: 'adminToken'
};

// Updated roles with more specific hospital roles
const ROLES = [
  { value: 'ADMIN', label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', category: 'admin' },
  { value: 'WARD_DOCTOR', label: 'Ward Doctor', color: 'bg-blue-100 text-blue-700 border-blue-200', category: 'doctor' },
  { value: 'WARD_NURSE', label: 'Ward Nurse', color: 'bg-green-100 text-green-700 border-green-200', category: 'nurse' },
  { value: 'CLINIC_DOCTOR', label: 'Clinic Doctor', color: 'bg-blue-100 text-blue-700 border-blue-200', category: 'doctor' },
  { value: 'CLINIC_NURSE', label: 'Clinic Nurse', color: 'bg-green-100 text-green-700 border-green-200', category: 'nurse' },
  { value: 'DIALYSIS_DOCTOR', label: 'Dialysis Doctor', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', category: 'doctor' },
  { value: 'DIALYSIS_NURSE', label: 'Dialysis Nurse', color: 'bg-teal-100 text-teal-700 border-teal-200', category: 'nurse' },
  { value: 'LAB_TECH', label: 'Lab Technician', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', category: 'support' },
  { value: 'PHARMACIST', label: 'Pharmacist', color: 'bg-red-100 text-red-700 border-red-200', category: 'support' }
];

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

// Nurse specializations
const NURSE_SPECIALIZATIONS = [
  { value: 'NEPHROLOGY_NURSING', label: 'Nephrology Nursing' },
  { value: 'DIALYSIS_NURSING', label: 'Dialysis Nursing' },
  { value: 'CRITICAL_CARE', label: 'Critical Care Nursing' },
  { value: 'TRANSPLANT_NURSING', label: 'Transplant Nursing' },
  { value: 'GENERAL_NURSING', label: 'General Nursing' },
  { value: 'PEDIATRIC_NURSING', label: 'Pediatric Nursing' },
  { value: 'SURGICAL_NURSING', label: 'Surgical Nursing' },
  { value: 'EMERGENCY_NURSING', label: 'Emergency Nursing' },
  { value: 'INFECTION_CONTROL', label: 'Infection Control' }
];

// Nurse shifts
const NURSE_SHIFTS = [
  { value: 'MORNING', label: 'Morning (6:00 AM - 2:00 PM)' },
  { value: 'EVENING', label: 'Evening (2:00 PM - 10:00 PM)' },
  { value: 'NIGHT', label: 'Night (10:00 PM - 6:00 AM)' },
  { value: 'ROTATING', label: 'Rotating Shifts' }
];

// Hospital wards
const WARDS = [
  { value: 'GENERAL_WARD', label: 'General Ward' },
  { value: 'ICU', label: 'Intensive Care Unit' },
  { value: 'DIALYSIS_WARD', label: 'Dialysis Ward' },
  { value: 'NEPHROLOGY_WARD', label: 'Nephrology Ward' },
  { value: 'TRANSPLANT_WARD', label: 'Transplant Ward' },
  { value: 'EMERGENCY_WARD', label: 'Emergency Ward' },
  { value: 'PEDIATRIC_WARD', label: 'Pediatric Ward' },
  { value: 'SURGICAL_WARD', label: 'Surgical Ward' }
];

// Role categories for filtering
const ROLE_CATEGORIES = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctors' },
  { value: 'nurse', label: 'Nurses' },
  { value: 'support', label: 'Support Staff' }
];

const API_ENDPOINTS = {
  ALL_USERS: '/api/auth/allUsers',
  REGISTER: '/api/auth/register',
  UPDATE: '/api/auth/update',
  DELETE: '/api/auth/delete'
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
      return "User already exists with this Employee ID or Username.";
    case 422:
      return "Invalid input data. Please check all fields.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return message || "An unexpected error occurred. Please try again.";
  }
};

const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }
  return null;
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
      case TOAST_TYPES.INFO:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className={`${baseClasses} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getProgressBarColor = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-500';
      case TOAST_TYPES.ERROR:
        return 'bg-red-500';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-500';
      case TOAST_TYPES.INFO:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
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
      {/* Enhanced Progress bar */}
      <div className="relative overflow-hidden">
        <div className={`h-1.5 ${getProgressBarColor(toast.type)}`}>
          <div className="h-full bg-white opacity-30 animate-pulse"></div>
        </div>
        <div className="absolute top-0 left-0 h-full bg-white opacity-20 animate-shimmer"></div>
      </div>
      
      {/* Enhanced Content */}
      <div className="p-5">
        <div className="flex items-start">
          <div className="relative">
            {getToastIcon(toast.type)}
            <div className="absolute -inset-1 bg-white opacity-20 rounded-full animate-ping"></div>
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

// Enhanced Toast Container
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

// Custom hooks
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function AdminDashboard() {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  // Count states for all staff types
  const [doctorCount, setDoctorCount] = useState(0);
  const [isLoadingDoctorCount, setIsLoadingDoctorCount] = useState(true);
  // Removed unused nurse count state and loading state
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("empId");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(CONFIG.ITEMS_PER_PAGE);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    empId: "",
    username: "",
    password: "",
    role: "",
  });
  
  // Doctor form state
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
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Selection for bulk operations
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, CONFIG.DEBOUNCE_DELAY);

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

  const showWarning = useCallback((message, title = 'Warning') => {
    addToast(message, TOAST_TYPES.WARNING, title);
  }, [addToast]);


  // API functions
  const makeApiCall = useCallback(async (method, endpoint, data = null) => {
    const token = getFromStorage(CONFIG.TOKEN_KEY);
    
    if (!token || isTokenExpired(token)) {
      throw new Error('Session expired. Please login again.');
    }

    const config = {
      method,
      url: `${CONFIG.API_BASE}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    return await axios(config);
  }, []);

  // Fetch doctor count
  const fetchDoctorCount = useCallback(async () => {
    setIsLoadingDoctorCount(true);
    try {
      const token = getFromStorage(CONFIG.TOKEN_KEY);
      
      if (!token || isTokenExpired(token)) {
        setDoctorCount(0);
        return;
      }

      const response = await fetch(`${CONFIG.API_BASE}/api/doctors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        // Handle different response formats
        if (result.data && Array.isArray(result.data)) {
          setDoctorCount(result.data.length);
        } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
          setDoctorCount(result.data.data.length);
        } else if (Array.isArray(result)) {
          setDoctorCount(result.length);
        } else {
          setDoctorCount(0);
        }
      } else {
        setDoctorCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch doctor count", error);
      setDoctorCount(0);
    } finally {
      setIsLoadingDoctorCount(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setFetchError(null);

    try {
      const response = await makeApiCall('GET', API_ENDPOINTS.ALL_USERS);
      
      const usersWithIds = response.data.map((user, index) => ({
        ...user,
        id: user.empId || `user-${index}`,
        createdAt: user.createdAt || new Date().toISOString()
      }));

      setUsers(usersWithIds);
      setSelectedUsers(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setFetchError(getErrorMessage(error));
    } finally {
      setIsLoadingUsers(false);
    }
  }, [makeApiCall]);

  // Filtering and sorting
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = !debouncedSearchTerm || 
        user.empId?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      
      const matchesCategory = !categoryFilter || 
        ROLES.find(r => r.value === user.role)?.category === categoryFilter;
      
      return matchesSearch && matchesRole && matchesCategory;
    });

    // Sort users
    filtered.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, debouncedSearchTerm, roleFilter, categoryFilter, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Updated statistics to include all new roles
  const statistics = useMemo(() => {
    const counts = {
      total: users.length,
      admin: users.filter(u => u.role === 'ADMIN').length,
      doctors: users.filter(u => ROLES.find(r => r.value === u.role)?.category === 'doctor').length,
      nurses: users.filter(u => ROLES.find(r => r.value === u.role)?.category === 'nurse').length,
      support: users.filter(u => ROLES.find(r => r.value === u.role)?.category === 'support').length,
      // Individual role counts
      wardDoctor: users.filter(u => u.role === 'WARD_DOCTOR').length,
      wardNurse: users.filter(u => u.role === 'WARD_NURSE').length,
      clinicDoctor: users.filter(u => u.role === 'CLINIC_DOCTOR').length,
      clinicNurse: users.filter(u => u.role === 'CLINIC_NURSE').length,
      dialysisDoctor: users.filter(u => u.role === 'DIALYSIS_DOCTOR').length,
      dialysisNurse: users.filter(u => u.role === 'DIALYSIS_NURSE').length,
      labTech: users.filter(u => u.role === 'LAB_TECH').length,
      pharmacist: users.filter(u => u.role === 'PHARMACIST').length,
    };
    return counts;
  }, [users]);

  // Form validation
  const validateForm = (userData, isEditing = false) => {
    const errors = {};
    
    if (!userData.empId?.trim()) {
      errors.empId = "Employee ID is required";
    } else if (!/^[A-Z0-9-]+$/.test(userData.empId.trim())) {
      errors.empId = "Employee ID should only contain uppercase letters, numbers, and hyphens";
    }
    
    if (!userData.username?.trim()) {
      errors.username = "Username is required";
    } else if (userData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters long";
    }
    
    if (!isEditing && !userData.password?.trim()) {
      errors.password = "Password is required";
    } else if (userData.password && validatePassword(userData.password)) {
      errors.password = validatePassword(userData.password);
    }
    
    if (!userData.role?.trim()) {
      errors.role = "Role is required";
    }
    
    return errors;
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  // Event handlers
  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      empId: user.empId,
      username: user.username,
      role: user.role,
      password: ''
    });
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async () => {
    const errors = validateForm(newUser);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await makeApiCall('POST', API_ENDPOINTS.REGISTER, {
        empId: newUser.empId.trim().toUpperCase(),
        username: newUser.username.trim(),
        password: newUser.password.trim(),
        role: newUser.role,
      });

      if (response.data.isSuccess) {
        setNewUser({ empId: "", username: "", password: "", role: "" });
        setIsCreateModalOpen(false);
        setValidationErrors({});
        setPasswordStrength(0);
        await fetchUsers();
        
        showSuccess('User created successfully!', 'User Created');
      } else {
        setValidationErrors({ general: response.data.message || "Failed to create user" });
      }
    } catch (error) {
      console.error(error);
      setValidationErrors({ general: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    const errors = validateForm(editingUser, true);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        username: editingUser.username.trim(),
        role: editingUser.role,
      };

      if (editingUser.password?.trim()) {
        updateData.password = editingUser.password.trim();
      }

      const response = await makeApiCall(
        'PATCH',
        `${API_ENDPOINTS.UPDATE}/${editingUser.empId}`,
        updateData
      );

      if (response.data.isSuccess) {
        setIsEditModalOpen(false);
        setEditingUser(null);
        setValidationErrors({});
        await fetchUsers();
        showSuccess('User updated successfully!', 'User Updated');
      } else {
        setValidationErrors({ general: response.data.message || "Failed to update user" });
      }
    } catch (error) {
      console.error(error);
      setValidationErrors({ general: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        const response = await makeApiCall('DELETE', `${API_ENDPOINTS.DELETE}/${userId}`);

        if (response.data.isSuccess) {
          setUsers(users.filter((user) => user.empId !== userId));
          setSelectedUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          showSuccess(`User "${username}" deleted successfully!`, 'User Deleted');
        } else {
          showError(response.data.message || "Failed to delete user", 'Delete Failed');
        }
      } catch (error) {
        console.error("Delete user error:", error);
        showError(getErrorMessage(error), 'Delete Failed');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    const usernames = users
      .filter(user => selectedUsers.has(user.empId))
      .map(user => user.username)
      .join(', ');
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.size} users: ${usernames}? This action cannot be undone.`)) {
      setIsLoading(true);
      let successCount = 0;
      let failCount = 0;
      
      for (const userId of selectedUsers) {
        try {
          const response = await makeApiCall('DELETE', `${API_ENDPOINTS.DELETE}/${userId}`);
          if (response.data.isSuccess) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Failed to delete user ${userId}:`, error);
          failCount++;
        }
      }
      
      setIsLoading(false);
      await fetchUsers();
      
      if (successCount > 0 && failCount === 0) {
        showSuccess(`Successfully deleted ${successCount} users.`, 'Bulk Delete Complete');
      } else if (successCount > 0 && failCount > 0) {
        showWarning(`Successfully deleted ${successCount} users. Failed to delete ${failCount} users.`, 'Bulk Delete Partial');
      } else {
        showError(`Failed to delete all ${failCount} users.`, 'Bulk Delete Failed');
      }
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(user => user.empId)));
    }
    setSelectAll(!selectAll);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Employee ID', 'Username', 'Role', 'Category', 'Created At'],
      ...filteredUsers.map(user => [
        user.empId,
        user.username,
        user.role,
        ROLES.find(r => r.value === user.role)?.category || 'Unknown',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccess(`Exported ${filteredUsers.length} users to CSV file.`, 'Export Complete');
  };

  // Doctor form validation
  const validateDoctorForm = (doctorData) => {
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

  // Handle doctor creation
  const handleCreateDoctor = async () => {
    const errors = validateDoctorForm(newDoctor);
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

      console.log('Sending doctor data:', doctorData); // Debug log

      // Use fetch API similar to DoctorManagement component
      const token = getFromStorage(CONFIG.TOKEN_KEY);
      
      console.log('Token from storage:', token ? 'Token exists' : 'No token found'); // Debug log
      console.log('Token expired check:', token ? isTokenExpired(token) : 'No token to check'); // Debug log
      
      // Temporarily bypass token validation to see the real API error
      console.log('Making API call to:', `${CONFIG.API_BASE}/api/doctors`); // Debug log

      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header only if token exists and is not expired
      if (token && !isTokenExpired(token)) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Added Authorization header'); // Debug log
      } else {
        console.log('Skipping Authorization header - will see what API returns'); // Debug log
      }

      const response = await fetch(`${CONFIG.API_BASE}/api/doctors`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(doctorData)
      });
      
      console.log('API Response status:', response.status); // Debug log
      
      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData); // Debug log
          errorMessage = errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('API Response result:', result); // Debug log

      // Handle different response formats
      if (
        result.success === true || 
        result.isSuccess === true || 
        result.status === 'success' ||
        result.statusCode === 200 ||
        response.status === 201 ||
        response.status === 200
      ) {
        // Success - reset form and close modal
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
        setIsDoctorModalOpen(false);
        setValidationErrors({});
        
        // Update doctor count after successful creation
        fetchDoctorCount();
        
        showSuccess('Doctor created successfully!', 'Doctor Created');
      } else {
        // Error - show error message
        const errorMessage = result.message || result.error || result.msg || "Failed to create doctor";
        setValidationErrors({ general: errorMessage });
        console.log('Error creating doctor:', errorMessage);
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // More detailed error handling
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Connection error. Please check if the server is running.';
      }
      
      if (error.message.includes('JSON')) {
        errorMessage = 'Server response format error. Please contact administrator.';
      }
      
      console.log('Setting error message:', errorMessage);
      setValidationErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const roleConfig = ROLES.find(r => r.value === role);
    return roleConfig ? roleConfig.color : "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Medium';
    return 'Strong';
  };

  // Initialize component
  useEffect(() => {
    fetchUsers();
    fetchDoctorCount();
  }, [fetchUsers, fetchDoctorCount]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newUser.password));
  }, [newUser.password]);

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
      
      {/* Enhanced Header with Gradient */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white opacity-20 rounded-xl blur-md"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <svg className="w-9 h-9 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Hospital Admin Dashboard</h1>
                <p className="text-gray-600 text-sm font-medium mt-1">National Institute of Nephrology, Dialysis and Transplantation</p>
                <div className="flex items-center mt-2 text-gray-500 text-xs">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            {/* Enhanced Mini Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total Staff', value: statistics.total, color: 'bg-white border border-gray-200 text-gray-800 shadow-sm', icon: '👥', clickable: false },
                { label: 'Doctors', value: doctorCount, color: 'bg-blue-50 border border-blue-200 text-blue-800 shadow-sm', icon: '👨‍⚕️', clickable: true, onClick: () => setIsDoctorModalOpen(true) },
                { label: 'Nurses', value: statistics.nurses, color: 'bg-green-50 border border-green-200 text-green-800 shadow-sm', icon: '👩‍⚕️', clickable: false },
                { label: 'Support', value: statistics.support, color: 'bg-gray-50 border border-gray-200 text-gray-800 shadow-sm', icon: '🔧', clickable: false }
              ].map((stat) => (
                <div key={stat.label} className="group relative">
                  <div className="absolute inset-0 bg-white opacity-10 rounded-lg blur-sm group-hover:opacity-20 transition-opacity"></div>
                  <div 
                    className={`relative ${stat.color} rounded-lg px-4 py-3 text-center hover:scale-105 transition-all duration-200 ${
                      stat.clickable ? 'cursor-pointer hover:shadow-md hover:border-blue-300 hover:bg-blue-100' : ''
                    }`}
                    onClick={stat.clickable ? stat.onClick : undefined}
                    title={stat.clickable ? `Click to add ${stat.label.toLowerCase()}` : undefined}
                  >
                    <div className="text-lg font-bold">
                      {stat.label === 'Doctors' ? (isLoadingDoctorCount ? '...' : stat.value) : (isLoadingUsers ? '...' : stat.value)}
                    </div>
                    <div className="text-xs font-medium mt-1">{stat.label}</div>
                    <div className="absolute top-1 right-2 text-lg opacity-60">{stat.icon}</div>
                    {stat.clickable && (
                      <div className="absolute top-1 left-2 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
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

          {/* Enhanced Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center w-full lg:w-auto">
                {/* Enhanced Search */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Employee ID or Username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 w-80 shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Enhanced Category Filter */}
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setRoleFilter('');
                    }}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm font-medium"
                  >
                    {ROLE_CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Enhanced Role Filter */}
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm font-medium"
                  >
                    <option value="">All Specific Roles</option>
                    {ROLES
                      .filter(role => !categoryFilter || role.category === categoryFilter)
                      .map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Bulk Actions */}
                {selectedUsers.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isLoading}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 px-5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete ({selectedUsers.size})</span>
                  </button>
                )}

                <button
                  onClick={exportUsers}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
                </button>

                <button
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-3 px-5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                >
                  <svg className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span>Create User</span>
                </button>
              </div>
            </div>

            {/* Enhanced Active Filters Display */}
            {(searchTerm || categoryFilter || roleFilter) && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Active filters:
                  </span>
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm border border-blue-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {categoryFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 shadow-sm border border-emerald-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Category: {ROLE_CATEGORIES.find(c => c.value === categoryFilter)?.label}
                      <button
                        onClick={() => setCategoryFilter('')}
                        className="ml-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-300 rounded-full p-0.5 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {roleFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 shadow-sm border border-purple-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Role: {ROLES.find(r => r.value === roleFilter)?.label}
                      <button
                        onClick={() => setRoleFilter('')}
                        className="ml-2 text-purple-600 hover:text-purple-800 hover:bg-purple-300 rounded-full p-0.5 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setRoleFilter('');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors font-medium border border-gray-200"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{fetchError}</span>
                <button
                  onClick={fetchUsers}
                  className="ml-auto text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Enhanced User Table */}
          <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all"
                        />
                        {selectedUsers.size > 0 && (
                          <span className="ml-2 text-xs font-medium text-blue-600">({selectedUsers.size})</span>
                        )}
                      </div>
                    </th>
                    {[
                      { key: 'empId', label: 'Employee ID', icon: '🆔' },
                      { key: 'username', label: 'Username', icon: '👤' },
                      { key: 'role', label: 'Role', icon: '🏥' },
                      { key: 'createdAt', label: 'Created', icon: '📅' }
                    ].map(({ key, label, icon }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-all duration-200 select-none group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm opacity-60">{icon}</span>
                          <span className="group-hover:text-blue-600 transition-colors">{label}</span>
                          {sortBy === key ? (
                            <svg className={`w-4 h-4 text-blue-600 transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <span className="flex items-center justify-end space-x-1">
                        <span>⚙️</span>
                        <span>Actions</span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xl font-semibold text-gray-700">Loading users...</p>
                            <p className="text-sm text-gray-500">Please wait while we fetch the latest data</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-all duration-200 group">
                        <td className="px-6 py-5">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.empId)}
                            onChange={() => handleSelectUser(user.empId)}
                            className="w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all"
                          />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                            </div>
                            <span className="text-sm font-bold text-gray-900 font-mono">{user.empId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm transition-shadow">
                                <span className="text-white font-bold text-sm">{user.username[0].toUpperCase()}</span>
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                              <div className="text-xs text-gray-500">Active user</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="inline-flex items-center">
                            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full border-2 ${getRoleBadgeColor(user.role)} shadow-sm`}>
                              <span className="w-2 h-2 rounded-full bg-current opacity-60 mr-2"></span>
                              {ROLES.find(r => r.value === user.role)?.label || user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{new Date(user.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="group/btn relative inline-flex items-center justify-center w-10 h-10 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-500 rounded-xl transition-all duration-200 border-2 border-blue-200 hover:border-blue-500 shadow-sm hover:shadow-blue-200 transform hover:scale-105"
                              title="Edit user"
                            >
                              <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.empId, user.username)}
                              className="group/btn relative inline-flex items-center justify-center w-10 h-10 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-500 shadow-sm hover:shadow-red-200 transform hover:scale-105"
                              title="Delete user"
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-xl">🔍</span>
                            </div>
                          </div>
                          <div className="text-center space-y-3">
                            <p className="text-xl font-bold text-gray-700">
                              {searchTerm || roleFilter || categoryFilter ? 'No users match your filters' : 'No users found'}
                            </p>
                            <p className="text-gray-500 max-w-md">
                              {searchTerm || roleFilter || categoryFilter ? 'Try adjusting your search criteria or clear the filters to see all users.' : 'Get started by creating your first user account for the hospital staff.'}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            {(searchTerm || roleFilter || categoryFilter) && (
                              <button
                                onClick={() => {
                                  setSearchTerm('');
                                  setRoleFilter('');
                                  setCategoryFilter('');
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
                              Create your first user
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredUsers.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {[...Array(Math.min(totalPages, 7))].map((_, index) => {
                        let pageNumber;
                        if (totalPages <= 7) {
                          pageNumber = index + 1;
                        } else {
                          if (currentPage <= 4) {
                            pageNumber = index + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNumber = totalPages - 6 + index;
                          } else {
                            pageNumber = currentPage - 3 + index;
                          }
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-blue-600 px-8 py-6 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Create New User</h3>
                  <p className="text-blue-100 text-sm">Add a new staff member to the system</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewUser({ empId: "", username: "", password: "", role: "" });
                  setValidationErrors({});
                  setPasswordStrength(0);
                }}
                className="text-white hover:text-gray-200 transition-colors hover:bg-white hover:bg-opacity-10 rounded-xl p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="p-8 space-y-6">
              {/* Enhanced General Error */}
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

              {/* Enhanced Employee ID */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 flex items-center space-x-1">
                  <span>🆔</span>
                  <span>Employee ID</span>
                  <span className="text-red-500 text-xs">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., EMP-2024-001"
                    value={newUser.empId}
                    onChange={(e) => setNewUser({ ...newUser, empId: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all duration-200 font-mono ${
                      validationErrors.empId ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 hover:border-gray-300'
                    }`}
                    aria-describedby={validationErrors.empId ? 'empId-error' : undefined}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className={`w-5 h-5 ${validationErrors.empId ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                {validationErrors.empId && (
                  <p id="empId-error" className="text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-left-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{validationErrors.empId}</span>
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    validationErrors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-describedby={validationErrors.username ? 'username-error' : undefined}
                />
                {validationErrors.username && (
                  <p id="username-error" className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    validationErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-describedby={validationErrors.password ? 'password-error' : 'password-help'}
                />
                
                {/* Password Strength Indicator */}
                {newUser.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength < 50 ? 'text-red-600' : 
                        passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                  </div>
                )}
                
                {validationErrors.password ? (
                  <p id="password-error" className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                ) : (
                  <p id="password-help" className="mt-1 text-sm text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    validationErrors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-describedby={validationErrors.role ? 'role-error' : undefined}
                >
                  <option value="">Select role</option>
                  <optgroup label="Administration">
                    <option value="ADMIN">Admin</option>
                  </optgroup>
                  <optgroup label="Doctors">
                    <option value="WARD_DOCTOR">Ward Doctor</option>
                    <option value="CLINIC_DOCTOR">Clinic Doctor</option>
                    <option value="DIALYSIS_DOCTOR">Dialysis Doctor</option>
                  </optgroup>
                  <optgroup label="Nurses">
                    <option value="WARD_NURSE">Ward Nurse</option>
                    <option value="CLINIC_NURSE">Clinic Nurse</option>
                    <option value="DIALYSIS_NURSE">Dialysis Nurse</option>
                  </optgroup>
                  <optgroup label="Support Staff">
                    <option value="LAB_TECH">Lab Technician</option>
                    <option value="PHARMACIST">Pharmacist</option>
                  </optgroup>
                </select>
                {validationErrors.role && (
                  <p id="role-error" className="mt-1 text-sm text-red-600">{validationErrors.role}</p>
                )}
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewUser({ empId: "", username: "", password: "", role: "" });
                    setValidationErrors({});
                    setPasswordStrength(0);
                  }}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isLoading ? 'Creating Account...' : 'Create User Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-indigo-600 px-8 py-6 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Edit User</h3>
                  <p className="text-indigo-100 text-sm">Update staff member information</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                  setValidationErrors({});
                }}
                className="text-white hover:text-gray-200 transition-colors hover:bg-white hover:bg-opacity-10 rounded-xl p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="p-6 space-y-4">
              {/* General Error */}
              {validationErrors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 text-sm">{validationErrors.general}</span>
                  </div>
                </div>
              )}

              {/* Employee ID (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  value={editingUser?.empId || ''}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="mt-1 text-sm text-gray-500">Employee ID cannot be changed</p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={editingUser?.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    validationErrors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-describedby={validationErrors.username ? 'edit-username-error' : undefined}
                />
                {validationErrors.username && (
                  <p id="edit-username-error" className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>

              {/* Password (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={editingUser?.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    validationErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-describedby={validationErrors.password ? 'edit-password-error' : 'edit-password-help'}
                />
                {validationErrors.password ? (
                  <p id="edit-password-error" className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                ) : (
                  <p id="edit-password-help" className="mt-1 text-sm text-gray-500">
                    Leave empty to keep current password
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingUser?.role || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    validationErrors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-describedby={validationErrors.role ? 'edit-role-error' : undefined}
                >
                  <option value="">Select role</option>
                  <optgroup label="Administration">
                    <option value="ADMIN">Admin</option>
                  </optgroup>
                  <optgroup label="Doctors">
                    <option value="WARD_DOCTOR">Ward Doctor</option>
                    <option value="CLINIC_DOCTOR">Clinic Doctor</option>
                    <option value="DIALYSIS_DOCTOR">Dialysis Doctor</option>
                  </optgroup>
                  <optgroup label="Nurses">
                    <option value="WARD_NURSE">Ward Nurse</option>
                    <option value="CLINIC_NURSE">Clinic Nurse</option>
                    <option value="DIALYSIS_NURSE">Dialysis Nurse</option>
                  </optgroup>
                  <optgroup label="Support Staff">
                    <option value="LAB_TECH">Lab Technician</option>
                    <option value="PHARMACIST">Pharmacist</option>
                  </optgroup>
                </select>
                {validationErrors.role && (
                  <p id="edit-role-error" className="mt-1 text-sm text-red-600">{validationErrors.role}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                    setValidationErrors({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-md transition-colors flex items-center space-x-2"
                >
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isLoading ? 'Updating...' : 'Update User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Add Modal */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-200 transform animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-8 py-6 rounded-t-3xl flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add New Doctor</h3>
                  <p className="text-blue-100 text-sm">Add a new doctor to the hospital staff</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsDoctorModalOpen(false);
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
                    setIsDoctorModalOpen(false);
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
                  <span>{isLoading ? 'Adding Doctor...' : 'Add Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}