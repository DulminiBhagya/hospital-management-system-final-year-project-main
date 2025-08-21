package com.HMS.HMS.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.HMS.HMS.model.Doctor.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // Find active doctors
    List<Doctor> findByIsActiveTrue();

    // Find with pagination
    Page<Doctor> findByIsActiveTrue(Pageable pageable);

    // Find by employee ID
    Optional<Doctor> findByEmpId(String empId);

    // Find by email
    Optional<Doctor> findByEmail(String email);

    // Find by license number
    Optional<Doctor> findByLicenseNumber(String licenseNumber);

    // Find by specialization
    List<Doctor> findBySpecialization(String specialization);

    // Find by department
    List<Doctor> findByDepartment(String department);

    // Search by multiple fields
    @Query("SELECT d FROM Doctor d WHERE " +
           "(LOWER(d.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.empId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "d.isActive = true")
    List<Doctor> searchDoctors(@Param("query") String query);

    // Check existence for duplicates (for new doctors)
    @Query("SELECT d FROM Doctor d WHERE d.empId = :empId OR d.email = :email OR d.licenseNumber = :licenseNumber")
    List<Doctor> findByEmpIdOrEmailOrLicenseNumber(@Param("empId") String empId, 
                                                   @Param("email") String email, 
                                                   @Param("licenseNumber") String licenseNumber);

    // Check existence for duplicates (for updates, excluding current doctor)
    @Query("SELECT d FROM Doctor d WHERE (d.empId = :empId OR d.email = :email OR d.licenseNumber = :licenseNumber) AND d.id != :excludeId")
    List<Doctor> findByEmpIdOrEmailOrLicenseNumberAndIdNot(@Param("empId") String empId, 
                                                          @Param("email") String email, 
                                                          @Param("licenseNumber") String licenseNumber, 
                                                          @Param("excludeId") Long excludeId);

    // Advanced search with filters
    @Query("SELECT d FROM Doctor d WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(d.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.empId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:specialization IS NULL OR :specialization = '' OR d.specialization = :specialization) AND " +
           "(:department IS NULL OR :department = '' OR d.department = :department) AND " +
           "d.isActive = true")
    List<Doctor> searchDoctorsWithFilters(@Param("query") String query, 
                                         @Param("specialization") String specialization,
                                         @Param("department") String department);

    // Count by specialization
    @Query("SELECT d.specialization, COUNT(d) FROM Doctor d WHERE d.isActive = true GROUP BY d.specialization")
    List<Object[]> countDoctorsBySpecialization();

    // Count by department
    @Query("SELECT d.department, COUNT(d) FROM Doctor d WHERE d.isActive = true GROUP BY d.department")
    List<Object[]> countDoctorsByDepartment();

    // Find by specialization and active status
    List<Doctor> findBySpecializationAndIsActiveTrue(String specialization);

    // Find by department and active status
    List<Doctor> findByDepartmentAndIsActiveTrue(String department);
}