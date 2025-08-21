package com.HMS.HMS.service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.HMS.HMS.model.Doctor.Doctor;
import com.HMS.HMS.repository.DoctorRepository;

@Service
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepo;

    public DoctorService(DoctorRepository doctorRepo) {
        this.doctorRepo = doctorRepo;
    }

    // Your existing methods
    public List<Doctor> getAllDoctors() {
        return doctorRepo.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepo.findById(id).orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    // Get active doctors only
    public List<Doctor> getActiveDoctors() {
        return doctorRepo.findByIsActiveTrue();
    }

    // Create new doctor
    public Doctor createDoctor(Doctor doctor) {
        // Validate doctor data
        validateDoctorData(doctor);
        
        // Check if doctor already exists by empId, email, or license number
        if (isDoctorExists(doctor.getEmpId(), doctor.getEmail(), doctor.getLicenseNumber(), null)) {
            throw new RuntimeException("Doctor already exists with this Employee ID, Email, or License Number");
        }

        // Set default values
        if (doctor.getIsActive() == null) {
            doctor.setIsActive(true);
        }

        return doctorRepo.save(doctor);
    }

    // Update existing doctor
    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        Doctor existingDoctor = getDoctorById(id);

        // Validate doctor data
        validateDoctorData(doctorDetails);

        // Check if updated details conflict with other doctors
        if (isDoctorExists(doctorDetails.getEmpId(), doctorDetails.getEmail(), 
                          doctorDetails.getLicenseNumber(), id)) {
            throw new RuntimeException("Another doctor already exists with this Employee ID, Email, or License Number");
        }

        // Update fields
        existingDoctor.setEmpId(doctorDetails.getEmpId());
        existingDoctor.setFirstName(doctorDetails.getFirstName());
        existingDoctor.setLastName(doctorDetails.getLastName());
        existingDoctor.setEmail(doctorDetails.getEmail());
        existingDoctor.setPhone(doctorDetails.getPhone());
        existingDoctor.setLicenseNumber(doctorDetails.getLicenseNumber());
        existingDoctor.setSpecialization(doctorDetails.getSpecialization());
        existingDoctor.setDepartment(doctorDetails.getDepartment());
        existingDoctor.setYearsOfExperience(doctorDetails.getYearsOfExperience());
        existingDoctor.setQualification(doctorDetails.getQualification());
        existingDoctor.setAddress(doctorDetails.getAddress());
        existingDoctor.setDateOfBirth(doctorDetails.getDateOfBirth());
        existingDoctor.setEmergencyContact(doctorDetails.getEmergencyContact());
        existingDoctor.setBloodGroup(doctorDetails.getBloodGroup());
        existingDoctor.setJoiningDate(doctorDetails.getJoiningDate());

        return doctorRepo.save(existingDoctor);
    }

    // Delete doctor (soft delete)
    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctor.setIsActive(false);
        doctorRepo.save(doctor);
    }

    // Hard delete doctor (permanent deletion)
    public void hardDeleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctorRepo.delete(doctor);
    }

    // Search doctors by name, empId, or email
    public List<Doctor> searchDoctors(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getActiveDoctors();
        }
        return doctorRepo.searchDoctors(query);
    }

    // Advanced search with filters
    public List<Doctor> searchDoctorsWithFilters(String query, String specialization, String department) {
        return doctorRepo.searchDoctorsWithFilters(query, specialization, department);
    }

    // Get doctors by specialization
    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepo.findBySpecializationAndIsActiveTrue(specialization);
    }

    // Get doctors by department
    public List<Doctor> getDoctorsByDepartment(String department) {
        return doctorRepo.findByDepartmentAndIsActiveTrue(department);
    }

    // Get doctor by employee ID
    public Optional<Doctor> getDoctorByEmpId(String empId) {
        return doctorRepo.findByEmpId(empId);
    }

    // Get doctor by email
    public Optional<Doctor> getDoctorByEmail(String email) {
        return doctorRepo.findByEmail(email);
    }

    // Get doctors with pagination
    public Page<Doctor> getDoctorsWithPagination(Pageable pageable) {
        return doctorRepo.findByIsActiveTrue(pageable);
    }

    // Get doctor statistics
    public Map<String, Object> getDoctorStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Doctor> allDoctors = getAllDoctors();
        List<Doctor> activeDoctors = getActiveDoctors();
        
        stats.put("totalCount", allDoctors.size());
        stats.put("activeCount", activeDoctors.size());
        stats.put("inactiveCount", allDoctors.size() - activeDoctors.size());
        
        // Count by specialization
        Map<String, Long> specializationCounts = new HashMap<>();
        List<Object[]> specializationData = doctorRepo.countDoctorsBySpecialization();
        for (Object[] data : specializationData) {
            specializationCounts.put(data[0].toString(), (Long) data[1]);
        }
        stats.put("bySpecialization", specializationCounts);
        
        // Count by department
        Map<String, Long> departmentCounts = new HashMap<>();
        List<Object[]> departmentData = doctorRepo.countDoctorsByDepartment();
        for (Object[] data : departmentData) {
            departmentCounts.put(data[0].toString(), (Long) data[1]);
        }
        stats.put("byDepartment", departmentCounts);
        
        return stats;
    }

    // Bulk operations
    public void bulkDeleteDoctors(List<Long> doctorIds) {
        List<Doctor> doctors = doctorRepo.findAllById(doctorIds);
        doctors.forEach(doctor -> doctor.setIsActive(false));
        doctorRepo.saveAll(doctors);
    }

    public void bulkActivateDoctors(List<Long> doctorIds) {
        List<Doctor> doctors = doctorRepo.findAllById(doctorIds);
        doctors.forEach(doctor -> doctor.setIsActive(true));
        doctorRepo.saveAll(doctors);
    }

    // Helper methods
    private boolean isDoctorExists(String empId, String email, String licenseNumber, Long excludeId) {
        List<Doctor> existingDoctors;
        
        if (excludeId != null) {
            // For updates - exclude current doctor
            existingDoctors = doctorRepo.findByEmpIdOrEmailOrLicenseNumberAndIdNot(empId, email, licenseNumber, excludeId);
        } else {
            // For new doctors
            existingDoctors = doctorRepo.findByEmpIdOrEmailOrLicenseNumber(empId, email, licenseNumber);
        }
        
        return !existingDoctors.isEmpty();
    }

    private void validateDoctorData(Doctor doctor) {
        if (doctor.getFirstName() == null || doctor.getFirstName().trim().isEmpty()) {
            throw new RuntimeException("First name is required");
        }
        if (doctor.getLastName() == null || doctor.getLastName().trim().isEmpty()) {
            throw new RuntimeException("Last name is required");
        }
        if (doctor.getEmail() == null || doctor.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (doctor.getEmpId() == null || doctor.getEmpId().trim().isEmpty()) {
            throw new RuntimeException("Employee ID is required");
        }
        if (doctor.getLicenseNumber() == null || doctor.getLicenseNumber().trim().isEmpty()) {
            throw new RuntimeException("License number is required");
        }
        if (doctor.getSpecialization() == null || doctor.getSpecialization().trim().isEmpty()) {
            throw new RuntimeException("Specialization is required");
        }
        if (doctor.getDepartment() == null || doctor.getDepartment().trim().isEmpty()) {
            throw new RuntimeException("Department is required");
        }
        if (doctor.getYearsOfExperience() == null || doctor.getYearsOfExperience() < 0) {
            throw new RuntimeException("Valid years of experience is required");
        }
        if (doctor.getQualification() == null || doctor.getQualification().trim().isEmpty()) {
            throw new RuntimeException("Qualification is required");
        }
        if (doctor.getDateOfBirth() == null) {
            throw new RuntimeException("Date of birth is required");
        }
        if (doctor.getJoiningDate() == null) {
            throw new RuntimeException("Joining date is required");
        }
    }
}