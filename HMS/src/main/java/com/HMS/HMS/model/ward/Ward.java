package com.HMS.HMS.model.ward;

import com.HMS.HMS.model.Admission.Admission;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Ward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long wardId;
    private String wardName;
    private String wardType;

    @OneToMany(mappedBy = "ward", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("ward-admissions")
    private List<Admission> admissions = new ArrayList<>();

    // Constructors
    public Ward() {}

    public Ward(String wardName, String wardType) {
        this.wardName = wardName;
        this.wardType = wardType;
    }

    // Admission management methods
    public void addAdmission(Admission admission) {
        admissions.add(admission);
        admission.setWard(this);
    }

    public void removeAdmission(Admission admission) {
        admissions.remove(admission);
        admission.setWard(null);
    }

    // Get current occupancy count
    public int getCurrentOccupancy() {
        return (int) admissions.stream()
                .filter(admission -> admission.getStatus().toString().equals("ACTIVE"))
                .count();
    }


    // Get all active admissions
    public List<Admission> getActiveAdmissions() {
        return admissions.stream()
                .filter(admission -> admission.getStatus().toString().equals("ACTIVE"))
                .toList();
    }

    // Getters and setters
    public Long getWardId() {
        return wardId;
    }

    public void setWardId(Long wardId) {
        this.wardId = wardId;
    }

    public String getWardName() {
        return wardName;
    }

    public void setWardName(String wardName) {
        this.wardName = wardName;
    }

    public String getWardType() {
        return wardType;
    }

    public void setWardType(String wardType) {
        this.wardType = wardType;
    }


    public List<Admission> getAdmissions() {
        return admissions;
    }

    public void setAdmissions(List<Admission> admissions) {
        this.admissions = admissions;
    }
}