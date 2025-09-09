package com.HMS.HMS.DTO.appoinmenetDTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateAppointmentRequest {

    private Long doctorEmployeeId;
    private Long patientNationalId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;

    public CreateAppointmentRequest() {
    }

    public CreateAppointmentRequest(Long doctorEmployeeId, Long patientNationalId,
                                    LocalDate appointmentDate, LocalTime appointmentTime) {
        this.doctorEmployeeId = doctorEmployeeId;
        this.patientNationalId = patientNationalId;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
    }

    public Long getDoctorEmployeeId() {
        return doctorEmployeeId;
    }

    public void setDoctorEmployeeId(Long doctorEmployeeId) {
        this.doctorEmployeeId = doctorEmployeeId;
    }

    public Long getPatientNationalId() {
        return patientNationalId;
    }

    public void setPatientNationalId(Long patientNationalId) {
        this.patientNationalId = patientNationalId;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }
}