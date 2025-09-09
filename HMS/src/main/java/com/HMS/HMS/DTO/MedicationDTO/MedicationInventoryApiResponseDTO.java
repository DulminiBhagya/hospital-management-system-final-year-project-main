package com.HMS.HMS.DTO.MedicationDTO;

import java.util.List;

public class MedicationInventoryApiResponseDTO {
    private boolean success;
    private String message;
    private List<MedicationInventoryResponseDTO> data;
    private PaginationResponseDTO pagination;

    public MedicationInventoryApiResponseDTO() {}

    public MedicationInventoryApiResponseDTO(boolean success, String message, 
                                           List<MedicationInventoryResponseDTO> data, 
                                           PaginationResponseDTO pagination) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.pagination = pagination;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<MedicationInventoryResponseDTO> getData() { return data; }
    public void setData(List<MedicationInventoryResponseDTO> data) { this.data = data; }

    public PaginationResponseDTO getPagination() { return pagination; }
    public void setPagination(PaginationResponseDTO pagination) { this.pagination = pagination; }
}