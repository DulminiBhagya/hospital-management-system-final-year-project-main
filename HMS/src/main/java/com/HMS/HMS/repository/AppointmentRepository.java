package com.HMS.HMS.repository;

import com.HMS.HMS.model.Appointment.Appointment;
import com.HMS.HMS.model.Doctor.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorAndDate(Doctor doctor, LocalDate date);
}
