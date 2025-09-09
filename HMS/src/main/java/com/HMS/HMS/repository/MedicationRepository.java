package com.HMS.HMS.repository;

import com.HMS.HMS.model.Medication.Medication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface MedicationRepository extends JpaRepository<Medication,Long> {
    boolean existsByBatchNumber(String batchNumber);
    Optional<Medication> findByBatchNumber(String batchNumber);

    // Basic search methods
    Page<Medication> findByDrugNameContainingIgnoreCase(String drugName, Pageable pageable);
    Page<Medication> findByCategoryIgnoreCase(String category, Pageable pageable);
    Page<Medication> findByDrugNameContainingIgnoreCaseAndCategoryIgnoreCase(String drugName, String category, Pageable pageable);

    // Active medications only
    Page<Medication> findByIsActiveTrue(Pageable pageable);
    
    // Low stock medications
    @Query("SELECT m FROM Medication m WHERE m.isActive = true AND m.currentStock <= m.minimumStock")
    Page<Medication> findLowStockMedications(Pageable pageable);
    
    // Expiring soon medications
    @Query("SELECT m FROM Medication m WHERE m.isActive = true AND m.expiryDate <= :expiryDate")
    Page<Medication> findExpiringSoonMedications(@Param("expiryDate") LocalDate expiryDate, Pageable pageable);
    
    // Combined search with all filters
    @Query("SELECT m FROM Medication m WHERE m.isActive = true " +
           "AND (:search IS NULL OR LOWER(m.drugName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR LOWER(m.category) = LOWER(:category)) " +
           "AND (:lowStock IS NULL OR :lowStock = false OR m.currentStock <= m.minimumStock) " +
           "AND (:expiringSoon IS NULL OR :expiringSoon <= 0 OR m.expiryDate <= :expiringDate)")
    Page<Medication> findMedicationsWithFilters(
            @Param("search") String search,
            @Param("category") String category,
            @Param("lowStock") Boolean lowStock,
            @Param("expiringSoon") Integer expiringSoon,
            @Param("expiringDate") LocalDate expiringDate,
            Pageable pageable);

    // Category-based search with active filter
    @Query("SELECT m FROM Medication m WHERE m.isActive = true AND LOWER(m.category) = LOWER(:category)")
    Page<Medication> findByActiveTrueAndCategoryIgnoreCase(@Param("category") String category, Pageable pageable);
    
    // Search in drug name and generic name
    @Query("SELECT m FROM Medication m WHERE m.isActive = true AND " +
           "(LOWER(m.drugName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Medication> findByActiveTrueAndSearchInNames(@Param("search") String search, Pageable pageable);
}
