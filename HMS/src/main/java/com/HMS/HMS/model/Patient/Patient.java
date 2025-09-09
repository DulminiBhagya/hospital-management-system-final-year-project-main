package com.HMS.HMS.model.Patient;

import com.HMS.HMS.model.Admission.Admission;
import com.HMS.HMS.model.Appointment.Appointment;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Patient {

    @Id
    @Column(unique = true, nullable = false)
    private Long nationalId;

    private String firstName;
    private String lastName;
    private String address;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String emergencyContactNumber;
    private String gender;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime registrationDate;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("patient-appointments") // This prevents circular reference
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "patient",cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    @JsonManagedReference("patient-admissions")
    private List<Admission> admissions  = new ArrayList<>();

    public Patient() {
    }

    public Patient(Long nationalId, String firstName, String lastName, String address, LocalDate dateOfBirth,
                   String contactNumber, String emergencyContactNumber, String gender) {
        this.nationalId = nationalId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.contactNumber = contactNumber;
        this.emergencyContactNumber = emergencyContactNumber;
        this.gender = gender;
    }

    public void addAppointment(Appointment appointment){
        appointments.add(appointment);
        appointment.setPatient(this);
    }

    public void removeAppointment(Appointment appointment){
        appointments.remove(appointment);
        appointment.setPatient(null);
    }

    public void addAdmission(Admission admission){
        admissions.add(admission);
        admission.setPatient(this);
    }

    public void removeAdmission(Admission admission){
        admissions.remove(admission);
        admission.setPatient(null);
    }

    public boolean isCurrentlyAdmitted(){
        return admissions.stream()
                .anyMatch(admission -> admission.getStatus().toString().equals("ACTIVE"));
    }

    public Admission getCurrentAdmission(){
        return admissions.stream()
                .filter(admission -> admission.getStatus().toString().equals("ACTIVE"))
                .findFirst()
                .orElse(null);
    }

    // Helper method to get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }

    // Getters and Setters
    public Long getNationalId() {
        return nationalId;
    }

    public void setNationalId(Long nationalId) {
        this.nationalId = nationalId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getEmergencyContactNumber() {
        return emergencyContactNumber;
    }

    public void setEmergencyContactNumber(String emergencyContactNumber) {
        this.emergencyContactNumber = emergencyContactNumber;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public List<Appointment> getAppointments(){
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments){
        this.appointments = appointments;
    }

    public List<Admission> getAdmissions() {
        return admissions;
    }

    public void setAdmissions(List<Admission> admissions) {
        this.admissions = admissions;
    }
}