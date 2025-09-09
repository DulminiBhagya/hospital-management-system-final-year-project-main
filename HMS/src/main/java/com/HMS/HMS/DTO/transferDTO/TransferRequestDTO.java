package com.HMS.HMS.DTO.transferDTO;

public class TransferRequestDTO {
    private Long admissionId;
    private Long newWardId;
    private String newBedNumber;
    private String transferReason;

    public TransferRequestDTO() {
    }

    public TransferRequestDTO(Long admissionId, Long newWardId, String newBedNumber, String transferReason) {
        this.admissionId = admissionId;
        this.newWardId = newWardId;
        this.newBedNumber = newBedNumber;
        this.transferReason = transferReason;
    }

    public Long getAdmissionId() {
        return admissionId;
    }

    public void setAdmissionId(Long admissionId) {
        this.admissionId = admissionId;
    }

    public Long getNewWardId() {
        return newWardId;
    }

    public void setNewWardId(Long newWardId) {
        this.newWardId = newWardId;
    }

    public String getNewBedNumber() {
        return newBedNumber;
    }

    public void setNewBedNumber(String newBedNumber) {
        this.newBedNumber = newBedNumber;
    }

    public String getTransferReason() {
        return transferReason;
    }

    public void setTransferReason(String transferReason) {
        this.transferReason = transferReason;
    }
}
