package com.HMS.HMS.model.doctor;

import com.HMS.HMS.model.Appointment.Appointment;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    private Long employeeId;

    private String doctorName;
    private String specialization;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("doctor-appointments") // This prevents circular reference
    private List<Appointment> appointments = new ArrayList<>();

    public Doctor() {
    }

    public Doctor(Long employeeId, String doctorName, String specialization) {
        this.employeeId = employeeId;
        this.doctorName = doctorName;
        this.specialization = specialization;
    }

    public void addAppointment(Appointment appointment){
        appointments.add(appointment);
        appointment.setDoctor(this);
    }

    public void removeAppointment(Appointment appointment){
        appointments.remove(appointment);
        appointment.setDoctor(null);
    }

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public List<Appointment> getAppointments(){
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments){
        this.appointments = appointments;
    }
}