package com.HMS.HMS.service;

import com.HMS.HMS.model.Doctor.Doctor;
import com.HMS.HMS.model.Patient.Patient;
import com.HMS.HMS.model.Appointment.Appointment;
import com.HMS.HMS.repository.*;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;
    private final PatientRepository patientRepo;

    public AppointmentService(AppointmentRepository appointmentRepo, 
                            DoctorRepository doctorRepo, 
                            PatientRepository patientRepo) {
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
    }

    public Appointment scheduleAppointment(Long doctorId, Long patientId, LocalDate date, String time) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setDate(date);
        appointment.setTime(java.time.LocalTime.parse(time));

        return appointmentRepo.save(appointment);
    }

    public List<Appointment> getAppointmentsForDoctor(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return appointmentRepo.findByDoctorAndDate(doctor, date);
    }
}

