package com.HMS.HMS.DTO.PatientDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientResponseDTO {
    private Long nationalId;
    private String firstName;
    private String lastName;
    private String address;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String emergencyContactNumber;
    private String gender;
    private LocalDateTime registrationDate;

    public PatientResponseDTO() {
    }

    public PatientResponseDTO(Long nationalId, String firstName, String lastName, String address,
                              LocalDate dateOfBirth, String contactNumber, String emergencyContactNumber,
                              String gender, LocalDateTime registrationDate) {
        this.nationalId = nationalId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.contactNumber = contactNumber;
        this.emergencyContactNumber = emergencyContactNumber;
        this.gender = gender;
        this.registrationDate = registrationDate;
    }

    // Helper method to get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }

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
}