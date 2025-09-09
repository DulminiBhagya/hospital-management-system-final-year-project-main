package com.HMS.HMS.DTO.MedicationDTO;

import java.time.LocalDateTime;

public class MedicationResponseDTO {
    private Long id;
    private String drugName;
    private String batchNumber;
    private LocalDateTime createdAt;

    public MedicationResponseDTO() {}

    public MedicationResponseDTO(Long id, String drugName, String batchNumber, LocalDateTime createdAt) {
        this.id = id;
        this.drugName = drugName;
        this.batchNumber = batchNumber;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getDrugName() { return drugName; }
    public String getBatchNumber() { return batchNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setDrugName(String drugName) { this.drugName = drugName; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
