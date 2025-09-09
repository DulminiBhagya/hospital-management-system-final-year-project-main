package com.HMS.HMS.service;


import com.HMS.HMS.Exception_Handler.DuplicateEmployeeIdException;
import com.HMS.HMS.model.doctor.Doctor;
import com.HMS.HMS.repository.DoctorRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {
    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository){
        this.doctorRepository = doctorRepository;
    }

    public Doctor addDoctor(Doctor doctor){
        if (doctorRepository.existsById(doctor.getEmployeeId())){
            throw new DuplicateEmployeeIdException("Doctor with Employee ID "+doctor.getEmployeeId() + " already exists");
        }
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors(){
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorByEmployeeId(Long employeeId){
        return doctorRepository.findById(employeeId);
    }

    public Doctor updateDoctor(Long employeeId,Doctor doctorDetails){
        return doctorRepository.findById(employeeId)
                .map(doctor -> {
                    doctor.setDoctorName(doctorDetails.getDoctorName());
                    doctor.setSpecialization(doctorDetails.getSpecialization());
                    return doctorRepository.save(doctor);
                })
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID "+employeeId));
    }

    public boolean deleteDoctor(Long employeeId){
        if (doctorRepository.existsById(employeeId)){
            doctorRepository.deleteById(employeeId);
            return true;
        }
        return false;
    }
}
