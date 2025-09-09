package com.HMS.HMS.repository;

import com.HMS.HMS.model.Patient.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient,Long> {
    boolean existsByNationalId(Long nationalId);
    Patient findByNationalId(Long nationalId);

    // Search by first name
    List<Patient> findByFirstNameContainingIgnoreCase(String firstName);

    // Search by last name
    List<Patient> findByLastNameContainingIgnoreCase(String lastName);

    // Search by either first name or last name
    @Query("SELECT p FROM Patient p WHERE " +
            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Patient> findByFirstNameOrLastNameContainingIgnoreCase(@Param("name") String name);

    // Search by full name (first name + last name combination)
    @Query("SELECT p FROM Patient p WHERE " +
            "LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :fullName, '%'))")
    List<Patient> findByFullNameContainingIgnoreCase(@Param("fullName") String fullName);

    Optional<Patient> findByContactNumber(String contactNumber);
    List<Patient> findByGender(String gender);
}