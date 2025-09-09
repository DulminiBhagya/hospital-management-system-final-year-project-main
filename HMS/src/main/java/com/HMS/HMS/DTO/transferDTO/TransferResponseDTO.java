package com.HMS.HMS.DTO.transferDTO;

import java.time.LocalDateTime;

public class TransferResponseDTO {
    private Long transferId;
    private Long patientNationalId;
    private String patientName;
    private Long fromWardId;
    private String fromWardName;
    private Long toWardId;
    private String toWardName;
    private String fromBedNumber;
    private String toBedNumber;
    private LocalDateTime transferDate;
    private String transferReason;
    private Long oldAdmissionId;
    private Long newAdmissionId;

    public TransferResponseDTO() {
    }

    public TransferResponseDTO(LocalDateTime transferDate, Long transferId, Long patientNationalId, String patientName, Long fromWardId, String fromWardName, Long toWardId, String toWardName, String fromBedNumber, String toBedNumber, String transferReason, Long oldAdmissionId, Long newAdmissionId) {
        this.transferDate = transferDate;
        this.transferId = transferId;
        this.patientNationalId = patientNationalId;
        this.patientName = patientName;
        this.fromWardId = fromWardId;
        this.fromWardName = fromWardName;
        this.toWardId = toWardId;
        this.toWardName = toWardName;
        this.fromBedNumber = fromBedNumber;
        this.toBedNumber = toBedNumber;
        this.transferReason = transferReason;
        this.oldAdmissionId = oldAdmissionId;
        this.newAdmissionId = newAdmissionId;
    }

    public Long getTransferId() {
        return transferId;
    }

    public void setTransferId(Long transferId) {
        this.transferId = transferId;
    }

    public Long getPatientNationalId() {
        return patientNationalId;
    }

    public void setPatientNationalId(Long patientNationalId) {
        this.patientNationalId = patientNationalId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getFromWardId() {
        return fromWardId;
    }

    public void setFromWardId(Long fromWardId) {
        this.fromWardId = fromWardId;
    }

    public String getFromWardName() {
        return fromWardName;
    }

    public void setFromWardName(String fromWardName) {
        this.fromWardName = fromWardName;
    }

    public Long getToWardId() {
        return toWardId;
    }

    public void setToWardId(Long toWardId) {
        this.toWardId = toWardId;
    }

    public String getToWardName() {
        return toWardName;
    }

    public void setToWardName(String toWardName) {
        this.toWardName = toWardName;
    }

    public String getFromBedNumber() {
        return fromBedNumber;
    }

    public void setFromBedNumber(String fromBedNumber) {
        this.fromBedNumber = fromBedNumber;
    }

    public String getToBedNumber() {
        return toBedNumber;
    }

    public void setToBedNumber(String toBedNumber) {
        this.toBedNumber = toBedNumber;
    }

    public LocalDateTime getTransferDate() {
        return transferDate;
    }

    public void setTransferDate(LocalDateTime transferDate) {
        this.transferDate = transferDate;
    }

    public String getTransferReason() {
        return transferReason;
    }

    public void setTransferReason(String transferReason) {
        this.transferReason = transferReason;
    }

    public Long getOldAdmissionId() {
        return oldAdmissionId;
    }

    public void setOldAdmissionId(Long oldAdmissionId) {
        this.oldAdmissionId = oldAdmissionId;
    }

    public Long getNewAdmissionId() {
        return newAdmissionId;
    }

    public void setNewAdmissionId(Long newAdmissionId) {
        this.newAdmissionId = newAdmissionId;
    }
}
