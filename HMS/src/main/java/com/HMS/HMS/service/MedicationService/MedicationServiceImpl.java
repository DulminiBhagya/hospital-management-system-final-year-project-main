package com.HMS.HMS.service.MedicationService;

import com.HMS.HMS.DTO.MedicationDTO.MedicationInventoryApiResponseDTO;
import com.HMS.HMS.DTO.MedicationDTO.MedicationInventoryResponseDTO;
import com.HMS.HMS.DTO.MedicationDTO.MedicationRequestDTO;
import com.HMS.HMS.DTO.MedicationDTO.MedicationResponseDTO;
import com.HMS.HMS.DTO.MedicationDTO.PaginationResponseDTO;
import com.HMS.HMS.Exception_Handler.DomainValidationException;
import com.HMS.HMS.Exception_Handler.DuplicateBatchNumberException;
import com.HMS.HMS.model.Medication.Medication;
import com.HMS.HMS.repository.MedicationRepository;
import com.HMS.HMS.util.Sanitizer;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MedicationServiceImpl implements MedicationService{

    private static final Logger log = LoggerFactory.getLogger(MedicationServiceImpl.class);
    private final MedicationRepository repository;

    public MedicationServiceImpl(MedicationRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public MedicationResponseDTO addMedication(MedicationRequestDTO request){
        if (repository.existsByBatchNumber(request.getBatchNumber().trim())){
            throw new DuplicateBatchNumberException(request.getBatchNumber());
        }
        if (request.getExpiryDate() == null || !request.getExpiryDate().isAfter(LocalDate.now())) {
            throw new DomainValidationException("Expiry date must be in the future");
        }
        if (request.getMinimumStock() > request.getMaximumStock()) {
            throw new DomainValidationException("minimumStock must be ≤ maximumStock");
        }

        Medication m = new Medication();
        m.setDrugName(Sanitizer.clean(request.getDrugName()));
        m.setGenericName(Sanitizer.clean(request.getGenericName()));
        m.setCategory(Sanitizer.clean(request.getCategory()));
        m.setStrength(Sanitizer.clean(request.getStrength()));
        m.setDosageForm(Sanitizer.clean(request.getDosageForm()));
        m.setManufacturer(Sanitizer.clean(request.getManufacturer()));
        m.setBatchNumber(Sanitizer.clean(request.getBatchNumber()));
        m.setCurrentStock(request.getCurrentStock());
        m.setMinimumStock(request.getMinimumStock());
        m.setMaximumStock(request.getMaximumStock());
        m.setUnitCost(request.getUnitCost());
        m.setExpiryDate(request.getExpiryDate());
        m.setIsActive(Boolean.TRUE);

        Medication saved = repository.save(m);
        log.info("Medication created: id={}, drugName={}, batch={}, stock={}",
                saved.getId(), saved.getDrugName(), saved.getBatchNumber(), saved.getCurrentStock());

        return new MedicationResponseDTO(saved.getId(), saved.getDrugName(), saved.getBatchNumber(), saved.getCreatedAt());
    }

    @Override
    public Page<MedicationResponseDTO> getAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(e -> new MedicationResponseDTO(e.getId(), e.getDrugName(), e.getBatchNumber(), e.getCreatedAt()));
    }

    @Override
    public Page<MedicationResponseDTO> search(String query, String category, Pageable pageable) {
        if (query != null && !query.isBlank() && category != null && !category.isBlank()) {
            return repository.findByDrugNameContainingIgnoreCaseAndCategoryIgnoreCase(query.trim(), category.trim(), pageable)
                    .map(e -> new MedicationResponseDTO(e.getId(), e.getDrugName(), e.getBatchNumber(), e.getCreatedAt()));
        } else if (query != null && !query.isBlank()) {
            return repository.findByDrugNameContainingIgnoreCase(query.trim(), pageable)
                    .map(e -> new MedicationResponseDTO(e.getId(), e.getDrugName(), e.getBatchNumber(), e.getCreatedAt()));
        } else if (category != null && !category.isBlank()) {
            return repository.findByCategoryIgnoreCase(category.trim(), pageable)
                    .map(e -> new MedicationResponseDTO(e.getId(), e.getDrugName(), e.getBatchNumber(), e.getCreatedAt()));
        } else {
            return getAll(pageable);
        }
    }

    @Override
    public MedicationInventoryApiResponseDTO getMedicationInventory(String search, String category, 
                                                                   Boolean lowStock, Integer expiringSoon, 
                                                                   Pageable pageable) {
        try {
            LocalDate expiringDate = null;
            if (expiringSoon != null && expiringSoon > 0) {
                expiringDate = LocalDate.now().plusDays(expiringSoon);
            }

            // Use the comprehensive filter query
            Page<Medication> medicationPage = repository.findMedicationsWithFilters(
                search != null ? search.trim() : null,
                category != null ? category.trim() : null,
                lowStock,
                expiringSoon,
                expiringDate,
                pageable
            );

            // Convert to DTOs
            List<MedicationInventoryResponseDTO> medicationDTOs = medicationPage.getContent().stream()
                    .map(this::convertToInventoryDTO)
                    .collect(Collectors.toList());

            // Create pagination info
            PaginationResponseDTO pagination = new PaginationResponseDTO(
                    medicationPage.getNumber(),
                    medicationPage.getSize(),
                    medicationPage.getTotalElements(),
                    medicationPage.getTotalPages()
            );

            String message = medicationDTOs.isEmpty() ? 
                    "No medications found matching the criteria" : 
                    "Medications retrieved successfully";

            log.info("Retrieved {} medications with filters - search: {}, category: {}, lowStock: {}, expiringSoon: {}", 
                    medicationDTOs.size(), search, category, lowStock, expiringSoon);

            return new MedicationInventoryApiResponseDTO(true, message, medicationDTOs, pagination);

        } catch (Exception e) {
            log.error("Error retrieving medication inventory: {}", e.getMessage(), e);
            throw new DomainValidationException("Failed to retrieve medication inventory: " + e.getMessage());
        }
    }

    private MedicationInventoryResponseDTO convertToInventoryDTO(Medication medication) {
        return new MedicationInventoryResponseDTO(
                medication.getId(),
                medication.getDrugName(),
                medication.getGenericName(),
                medication.getCategory(),
                medication.getStrength(),
                medication.getDosageForm(),
                medication.getManufacturer(),
                medication.getBatchNumber(),
                medication.getCurrentStock(),
                medication.getMinimumStock(),
                medication.getMaximumStock(),
                medication.getUnitCost(),
                medication.getExpiryDate(),
                medication.getCreatedAt(),
                medication.getUpdatedAt(),
                medication.getIsActive()
        );
    }
}
