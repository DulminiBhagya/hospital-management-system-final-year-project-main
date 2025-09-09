package com.HMS.HMS.service;

import com.HMS.HMS.DTO.appoinmenetDTO.AppointmentResponse;
import com.HMS.HMS.DTO.appoinmenetDTO.CreateAppointmentRequest;
import com.HMS.HMS.model.Appointment.Appointment;
import com.HMS.HMS.model.Appointment.AppointmentStatus;
import com.HMS.HMS.model.Patient.Patient;
import com.HMS.HMS.model.doctor.Doctor;
import com.HMS.HMS.repository.AppointmentRepository;
import com.HMS.HMS.repository.DoctorRepository;
import com.HMS.HMS.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public AppointmentResponse createAppointment(CreateAppointmentRequest request){
        Doctor doctor = doctorRepository.findById(request.getDoctorEmployeeId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + request.getDoctorEmployeeId()));

        Patient patient = patientRepository.findById(request.getPatientNationalId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: "+request.getPatientNationalId()));

        Optional<Appointment> existingAppointment = appointmentRepository
                .findByDoctorAndDateTime(request.getDoctorEmployeeId(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime());

        if (existingAppointment.isPresent() &&
                existingAppointment.get().getStatus() != AppointmentStatus.CANCELLED){
            throw new RuntimeException("Doctor is already booked at this time");
        }

        Appointment appointment = new Appointment();

        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        appointment = appointmentRepository.save(appointment);

        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getAllAppointments(){
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get appointment by ID
    public AppointmentResponse getAppointmentById(Long appointmentId){
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));
        return mapToResponse(appointment);
    }

    // Get appointments by patient ID
    public List<AppointmentResponse> getAppointmentsByPatientId(Long patientId){
        return appointmentRepository.findByPatientNationalId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get appointments by doctor ID
    public List<AppointmentResponse> getAppointmentsByDoctorId(Long doctorId){
        return appointmentRepository.findByDoctorEmployeeId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get appointments by date
    public List<AppointmentResponse> getAppointmentsByDate(LocalDate date){
        return appointmentRepository.findByAppointmentDate(date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get appointments for doctor on specific date
    public List<AppointmentResponse> getDoctorAppointmentsByDate(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorEmployeeIdAndAppointmentDate(doctorId, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Update appointment status
    public AppointmentResponse updateAppointmentStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);

        return mapToResponse(appointment);
    }

    // Cancel appointment
    public AppointmentResponse cancelAppointment(Long appointmentId) {
        return updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED);
    }

    // Confirm appointment
    public AppointmentResponse confirmAppointment(Long appointmentId) {
        return updateAppointmentStatus(appointmentId, AppointmentStatus.CONFIRMED);
    }

    // Complete appointment
    public AppointmentResponse completeAppointment(Long appointmentId) {
        return updateAppointmentStatus(appointmentId, AppointmentStatus.COMPLETED);
    }

    // Delete appointment
    public void deleteAppointment(Long appointmentId) {
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new RuntimeException("Appointment not found with ID: " + appointmentId);
        }
        appointmentRepository.deleteById(appointmentId);
    }

    // Get appointments by status
    public List<AppointmentResponse> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get appointments between dates
    public List<AppointmentResponse> getAppointmentsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return appointmentRepository.findAppointmentsBetweenDates(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get upcoming appointments for doctor
    public List<AppointmentResponse> getUpcomingAppointmentsByDoctor(Long doctorId) {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        return appointmentRepository.findUpcomingAppointmentsByDoctor(doctorId, currentDate, currentTime).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get upcoming appointments for patient
    public List<AppointmentResponse> getUpcomingAppointmentsByPatient(Long patientId) {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        return appointmentRepository.findUpcomingAppointmentsByPatient(patientId, currentDate, currentTime).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AppointmentResponse mapToResponse(Appointment appointment){
        AppointmentResponse response = new AppointmentResponse();
        response.setAppointmentId(appointment.getAppointmentId());
        response.setDoctorEmployeeId(appointment.getDoctor().getEmployeeId());
        response.setDoctorName(appointment.getDoctor().getDoctorName());
        response.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
        response.setPatientNationalId(appointment.getPatient().getNationalId());
        response.setPatientName(appointment.getPatient().getFullName());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setAppointmentTime(appointment.getAppointmentTime());
        response.setStatus(appointment.getStatus());
        response.setCreatedAt(appointment.getCreatedAt());
        return response;
    }
}