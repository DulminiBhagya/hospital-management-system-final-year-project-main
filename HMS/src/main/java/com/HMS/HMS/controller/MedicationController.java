package com.HMS.HMS.controller;

import com.HMS.HMS.DTO.MedicationDTO.ApiResponse;
import com.HMS.HMS.DTO.MedicationDTO.MedicationInventoryApiResponseDTO;
import com.HMS.HMS.DTO.MedicationDTO.MedicationRequestDTO;
import com.HMS.HMS.DTO.MedicationDTO.MedicationResponseDTO;
import com.HMS.HMS.service.MedicationService.MedicationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/pharmacy/medications")
public class MedicationController {
    private final MedicationService service;

    public MedicationController(MedicationService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<MedicationResponseDTO>> add(@RequestBody MedicationRequestDTO request){
        MedicationResponseDTO dto = service.addMedication(request);
        var location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(dto.getId())
                .toUri();

        ApiResponse<MedicationResponseDTO> body =
                new ApiResponse<>(true,"Medication added successfully",dto);

        return ResponseEntity.created(location).body(body);
    }

    @GetMapping
    public ResponseEntity<Page<MedicationResponseDTO>> list(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size,
            @RequestParam(defaultValue="id,desc") String[] sort
    ){
        Sort sortSpec = Sort.by(
                (sort.length == 2)
                ? new Sort.Order(Sort.Direction.fromString(sort[1]),sort[0])
                        : Sort.Order.desc("id")
        );
        Pageable pageable = PageRequest.of(page,Math.min(size,100),sortSpec);
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<MedicationResponseDTO>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="drugName,asc") String[] sort
    ){
        Sort sortSpec = Sort.by(
                (sort.length == 2)
                        ? new Sort.Order(Sort.Direction.fromString(sort[1]), sort[0])
                        : Sort.Order.asc("drugName")
        );
        Pageable pageable = PageRequest.of(page,Math.min(size,100),sortSpec);
        return ResponseEntity.ok(service.search(query,category,pageable));
    }

    @GetMapping("/inventory")
    public ResponseEntity<MedicationInventoryApiResponseDTO> getMedicationInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(required = false) Integer expiringSoon,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "drugName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder
    ) {
        try {
            // Validate sort direction
            Sort.Direction direction = Sort.Direction.ASC;
            if ("desc".equalsIgnoreCase(sortOrder)) {
                direction = Sort.Direction.DESC;
            }

            // Validate and limit page size
            size = Math.min(size, 100);
            
            // Validate expiringSoon parameter
            if (expiringSoon != null && expiringSoon < 0) {
                expiringSoon = 30; // Default to 30 days
            }

            // Create pageable with sorting
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            MedicationInventoryApiResponseDTO response = service.getMedicationInventory(
                    search, category, lowStock, expiringSoon, pageable);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // Handle invalid sort parameters
            return ResponseEntity.badRequest().body(
                    new MedicationInventoryApiResponseDTO(false, 
                            "Invalid parameters: " + e.getMessage(), null, null));
        } catch (Exception e) {
            // Handle other errors
            return ResponseEntity.internalServerError().body(
                    new MedicationInventoryApiResponseDTO(false, 
                            "Internal server error: " + e.getMessage(), null, null));
        }
    }
}
