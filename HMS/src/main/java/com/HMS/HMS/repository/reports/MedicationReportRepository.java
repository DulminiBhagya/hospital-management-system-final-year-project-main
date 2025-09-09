package com.HMS.HMS.repository.reports;

import com.HMS.HMS.model.Medication.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationReportRepository extends JpaRepository<Medication, Long> {

    // All active medications for inventory report
    @Query("SELECT m FROM Medication m WHERE m.isActive = true ORDER BY m.category, m.drugName")
    List<Medication> findAllActiveMedicationsForReport();

    // Low stock medications
    @Query("SELECT m FROM Medication m WHERE m.isActive = true AND m.currentStock <= m.minimumStock ORDER BY m.category, m.drugName")
    List<Medication> findLowStockMedicationsForReport();

    // Expiring medications
    @Query("SELECT m FROM Medication m WHERE m.isActive = true AND m.expiryDate <= :expiryDate ORDER BY m.expiryDate, m.drugName")
    List<Medication> findExpiringMedicationsForReport(@Param("expiryDate") LocalDate expiryDate);

    // Category summary data
    @Query("SELECT m.category as category, " +
           "COUNT(m) as totalMedications, " +
           "SUM(m.currentStock) as totalStock, " +
           "COUNT(CASE WHEN m.currentStock <= m.minimumStock THEN 1 END) as lowStockCount, " +
           "COUNT(CASE WHEN m.expiryDate <= :expiryThreshold THEN 1 END) as expiringSoonCount, " +
           "SUM(m.currentStock * m.unitCost) as totalValue, " +
           "AVG(m.unitCost) as averageUnitCost " +
           "FROM Medication m " +
           "WHERE m.isActive = true " +
           "GROUP BY m.category " +
           "ORDER BY m.category")
    List<Object[]> findCategorySummaryData(@Param("expiryThreshold") LocalDate expiryThreshold);

    // Annual inventory value by month
    @Query("SELECT MONTH(m.createdAt) as month, " +
           "MONTHNAME(m.createdAt) as monthName, " +
           "COUNT(m) as addedCount, " +
           "SUM(m.currentStock * m.unitCost) as monthValue " +
           "FROM Medication m " +
           "WHERE m.isActive = true AND YEAR(m.createdAt) = :year " +
           "GROUP BY MONTH(m.createdAt), MONTHNAME(m.createdAt) " +
           "ORDER BY MONTH(m.createdAt)")
    List<Object[]> findAnnualInventoryByMonth(@Param("year") int year);

    // Total inventory statistics
    @Query("SELECT COUNT(m) as totalMedications, " +
           "SUM(m.currentStock) as totalStock, " +
           "SUM(m.currentStock * m.unitCost) as totalValue, " +
           "COUNT(CASE WHEN m.currentStock <= m.minimumStock THEN 1 END) as lowStockCount, " +
           "COUNT(CASE WHEN m.expiryDate <= :expiryThreshold THEN 1 END) as expiringSoonCount " +
           "FROM Medication m WHERE m.isActive = true")
    Object[] findInventoryStatistics(@Param("expiryThreshold") LocalDate expiryThreshold);
}