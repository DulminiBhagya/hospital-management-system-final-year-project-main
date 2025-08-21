package com.HMS.HMS.repository;

import com.HMS.HMS.model.Patient.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient,Long> {
    boolean existsByNationalId(String nationalId);
    Patient findByNationalId(String nationalId);
}
