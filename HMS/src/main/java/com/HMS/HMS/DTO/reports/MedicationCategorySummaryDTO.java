package com.HMS.HMS.DTO.reports;

import java.math.BigDecimal;

public class MedicationCategorySummaryDTO {
    private String category;
    private Long totalMedications;
    private Integer totalStock;
    private Integer lowStockCount;
    private Integer expiringSoonCount;
    private BigDecimal totalValue;
    private BigDecimal averageUnitCost;

    public MedicationCategorySummaryDTO() {}

    public MedicationCategorySummaryDTO(String category, Long totalMedications, Integer totalStock, 
                                       Integer lowStockCount, Integer expiringSoonCount, BigDecimal totalValue, 
                                       BigDecimal averageUnitCost) {
        this.category = category;
        this.totalMedications = totalMedications;
        this.totalStock = totalStock;
        this.lowStockCount = lowStockCount;
        this.expiringSoonCount = expiringSoonCount;
        this.totalValue = totalValue;
        this.averageUnitCost = averageUnitCost;
    }

    // Getters and Setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getTotalMedications() { return totalMedications; }
    public void setTotalMedications(Long totalMedications) { this.totalMedications = totalMedications; }

    public Integer getTotalStock() { return totalStock; }
    public void setTotalStock(Integer totalStock) { this.totalStock = totalStock; }

    public Integer getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(Integer lowStockCount) { this.lowStockCount = lowStockCount; }

    public Integer getExpiringSoonCount() { return expiringSoonCount; }
    public void setExpiringSoonCount(Integer expiringSoonCount) { this.expiringSoonCount = expiringSoonCount; }

    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }

    public BigDecimal getAverageUnitCost() { return averageUnitCost; }
    public void setAverageUnitCost(BigDecimal averageUnitCost) { this.averageUnitCost = averageUnitCost; }
}