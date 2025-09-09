package com.HMS.HMS.service.MedicationService;

import com.HMS.HMS.DTO.MedicationDTO.MedicationInventoryApiResponseDTO;
import com.HMS.HMS.DTO.MedicationDTO.MedicationRequestDTO;
import com.HMS.HMS.DTO.MedicationDTO.MedicationResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MedicationService {
    MedicationResponseDTO addMedication(MedicationRequestDTO request);
    Page<MedicationResponseDTO> getAll(Pageable pageable);
    Page<MedicationResponseDTO> search(String query, String category, Pageable pageable);
    
    // New inventory methods
    MedicationInventoryApiResponseDTO getMedicationInventory(String search, String category, 
                                                           Boolean lowStock, Integer expiringSoon, 
                                                           Pageable pageable);
}
