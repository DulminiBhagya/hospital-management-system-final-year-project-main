package com.HMS.HMS.repository;

import com.HMS.HMS.model.Appointment.Appointment;
import com.HMS.HMS.model.Appointment.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Find all appointments for a specific doctor
    List<Appointment> findByDoctorEmployeeId(Long doctorId);

    // Find all appointments for a specific patient
    List<Appointment> findByPatientNationalId(Long patientId);

    // Find appointments by date
    List<Appointment> findByAppointmentDate(LocalDate date);

    // Find appointments for a doctor on a specific date - ADDED THIS MISSING METHOD
    List<Appointment> findByDoctorEmployeeIdAndAppointmentDate(Long doctorId, LocalDate date);

    // Find appointments for a patient on a specific date
    List<Appointment> findByPatientNationalIdAndAppointmentDate(Long patientId, LocalDate date);

    // Find appointments by status
    List<Appointment> findByStatus(AppointmentStatus status);

    // Find appointments for a doctor with specific status
    List<Appointment> findByDoctorEmployeeIdAndStatus(Long doctorId, AppointmentStatus status);

    // Check if a doctor has an appointment at a specific date and time
    @Query("SELECT a FROM Appointment a WHERE a.doctor.employeeId = :doctorId " +
            "AND a.appointmentDate = :date AND a.appointmentTime = :time")
    Optional<Appointment> findByDoctorAndDateTime(@Param("doctorId") Long doctorId,
                                                  @Param("date") LocalDate date,
                                                  @Param("time") LocalTime time);

    // Find appointments between date range
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate")
    List<Appointment> findAppointmentsBetweenDates(@Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    // Find upcoming appointments for a doctor
    @Query("SELECT a FROM Appointment a WHERE a.doctor.employeeId = :doctorId " +
            "AND (a.appointmentDate > :currentDate OR " +
            "(a.appointmentDate = :currentDate AND a.appointmentTime >= :currentTime)) " +
            "ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findUpcomingAppointmentsByDoctor(@Param("doctorId") Long doctorId,
                                                       @Param("currentDate") LocalDate currentDate,
                                                       @Param("currentTime") LocalTime currentTime);

    // Find upcoming appointments for a patient
    @Query("SELECT a FROM Appointment a WHERE a.patient.nationalId = :patientId " +
            "AND (a.appointmentDate > :currentDate OR " +
            "(a.appointmentDate = :currentDate AND a.appointmentTime >= :currentTime)) " +
            "ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findUpcomingAppointmentsByPatient(@Param("patientId") Long patientId,
                                                        @Param("currentDate") LocalDate currentDate,
                                                        @Param("currentTime") LocalTime currentTime);
}