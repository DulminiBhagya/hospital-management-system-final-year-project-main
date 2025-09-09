package com.HMS.HMS.repository;

import com.HMS.HMS.model.doctor.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor,Long> {
    List<Doctor> findBySpecialization(String specialization);
    List<Doctor> findByDoctorNameContainingIgnoreCase(String name);
    boolean existsByEmployeeId(Long employeeId);

}


