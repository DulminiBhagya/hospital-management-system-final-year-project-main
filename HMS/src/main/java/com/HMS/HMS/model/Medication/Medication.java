package com.HMS.HMS.model.Medication;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medications",uniqueConstraints = @UniqueConstraint(name = "uk_med_batch",columnNames = {"batch_number"}))
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="drug_name", nullable=false, length=255)
    private String drugName;

    @Column(name="generic_name", nullable=false, length=255)
    private String genericName;

    @Column(name="category", nullable=false, length=100)
    private String category;

    @Column(name="strength", nullable=false, length=50)
    private String strength;

    @Column(name="dosage_form", nullable=false, length=50)
    private String dosageForm;

    @Column(name="manufacturer", length=255)
    private String manufacturer;

    @Column(name="batch_number", nullable=false, length=100, unique=true)
    private String batchNumber;

    @Column(name="current_stock", nullable=false)
    private Integer currentStock = 0;

    @Column(name="minimum_stock", nullable=false)
    private Integer minimumStock = 0;

    @Column(name="maximum_stock", nullable=false)
    private Integer maximumStock = 0;

    @Column(name="unit_cost", nullable=false, precision=10, scale=2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name="expiry_date", nullable=false)
    private LocalDate expiryDate;

    @CreationTimestamp
    @Column(name="created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Column(name="is_active", nullable=false)
    private Boolean isActive = Boolean.TRUE;

    public Medication(){}

    public Medication(Long id, String drugName, String genericName, String category, String strength, String dosageForm, String manufacturer, String batchNumber, Integer currentStock, Integer minimumStock, Integer maximumStock, BigDecimal unitCost, LocalDate expiryDate, LocalDateTime createdAt, LocalDateTime updatedAt, Boolean isActive) {
        this.id = id;
        this.drugName = drugName;
        this.genericName = genericName;
        this.category = category;
        this.strength = strength;
        this.dosageForm = dosageForm;
        this.manufacturer = manufacturer;
        this.batchNumber = batchNumber;
        this.currentStock = currentStock;
        this.minimumStock = minimumStock;
        this.maximumStock = maximumStock;
        this.unitCost = unitCost;
        this.expiryDate = expiryDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isActive = isActive;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDrugName() { return drugName; }
    public void setDrugName(String drugName) { this.drugName = drugName; }

    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStrength() { return strength; }
    public void setStrength(String strength) { this.strength = strength; }

    public String getDosageForm() { return dosageForm; }
    public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Integer getMinimumStock() { return minimumStock; }
    public void setMinimumStock(Integer minimumStock) { this.minimumStock = minimumStock; }

    public Integer getMaximumStock() { return maximumStock; }
    public void setMaximumStock(Integer maximumStock) { this.maximumStock = maximumStock; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

}
