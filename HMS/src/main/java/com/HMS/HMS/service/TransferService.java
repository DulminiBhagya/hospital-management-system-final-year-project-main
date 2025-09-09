package com.HMS.HMS.service;

import com.HMS.HMS.DTO.transferDTO.TransferRequestDTO;
import com.HMS.HMS.DTO.transferDTO.TransferResponseDTO;
import com.HMS.HMS.model.Admission.Admission;
import com.HMS.HMS.model.Admission.AdmissionStatus;
import com.HMS.HMS.model.Transfer.Transfer;
import com.HMS.HMS.model.ward.Ward;
import com.HMS.HMS.repository.AdmissionRepository;
import com.HMS.HMS.repository.TransferRepository;
import com.HMS.HMS.repository.WardRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransferService {

    private final TransferRepository transferRepository;
    private final AdmissionRepository admissionRepository;
    private final WardRepository wardRepository;


    public TransferService(TransferRepository transferRepository, AdmissionRepository admissionRepository, WardRepository wardRepository) {
        this.transferRepository = transferRepository;
        this.admissionRepository = admissionRepository;
        this.wardRepository = wardRepository;
    }

    public TransferResponseDTO transferPatientInstantly(TransferRequestDTO request){

        Admission currentAdmission = getAdmissionByIdOrThrow(request.getAdmissionId());

        if (currentAdmission.getStatus() != AdmissionStatus.ACTIVE){
            throw new IllegalArgumentException("Patient is not currently admitted");
        }

        Ward newWard = getWardByIdOrThrow(request.getNewWardId());

        if (request.getNewBedNumber() == null || request.getNewBedNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Bed number is required for transfer");
        }

        if (isBedOccupied(request.getNewWardId(),request.getNewBedNumber())){
            throw new IllegalArgumentException("Bed " + request.getNewBedNumber() +
                    " in ward " + newWard.getWardName() + " is already occupied");
        }
        return performInstantTransfer(currentAdmission, newWard, request);
    }

    private TransferResponseDTO performInstantTransfer(Admission currentAdmission,Ward newWard,TransferRequestDTO request){
        Ward oldWard = currentAdmission.getWard();
        String oldBedNumber = currentAdmission.getBedNumber();

        currentAdmission.setStatus(AdmissionStatus.TRANSFERRED);
        currentAdmission.setDischargeDate(LocalDateTime.now());
        admissionRepository.save(currentAdmission);

        Admission newAdmission = new Admission(
                currentAdmission.getPatient(),
                newWard,
                request.getNewBedNumber().trim()
        );
        newAdmission.setStatus(AdmissionStatus.ACTIVE);
        Admission savedNewAdmission = admissionRepository.save(newAdmission);

        Transfer transfer = new Transfer(
                currentAdmission.getPatient(),
                oldWard,
                newWard,
                currentAdmission,
                savedNewAdmission,
                oldBedNumber,
                request.getNewBedNumber().trim(),
                request.getTransferReason()
        );

        Transfer savedTransfer = transferRepository.save(transfer);

        currentAdmission.getPatient().addAdmission(savedNewAdmission);
        newWard.addAdmission(savedNewAdmission);

        return convertToResponseDTO(savedTransfer);
    }

    public List<TransferResponseDTO> getTransferHistory(Long patientNationalId){
        return transferRepository.findPatientTransferHistory(patientNationalId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<TransferResponseDTO> getWardTransfers(Long wardId){
        List<Transfer> fromTransfers = transferRepository.findByFromWardWardId(wardId);
        List<Transfer> toTransfers = transferRepository.findByToWardWardId(wardId);

        fromTransfers.addAll(toTransfers);
        return fromTransfers.stream()
                .distinct()
                .map(this::convertToResponseDTO)
                .sorted((t1,t2) -> t2.getTransferDate().compareTo(t1.getTransferDate()))
                .collect(Collectors.toList());
    }

    public List<TransferResponseDTO> getAllTransfers(){
        return transferRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    private boolean isBedOccupied(Long wardId, String bedNumber){
        return admissionRepository.existsByWardWardIdAndBedNumberAndStatus(
                wardId,bedNumber.trim(),AdmissionStatus.ACTIVE
        );
    }

    private Admission getAdmissionByIdOrThrow(Long admissionId) {
        return admissionRepository.findById(admissionId)
                .orElseThrow(() -> new IllegalArgumentException("Admission with ID " + admissionId + " not found"));
    }

    private Ward getWardByIdOrThrow(Long wardId) {
        return wardRepository.findById(wardId)
                .orElseThrow(() -> new IllegalArgumentException("Ward with ID " + wardId + " not found"));
    }

    private TransferResponseDTO convertToResponseDTO(Transfer transfer) {
        return new TransferResponseDTO(
                transfer.getTransferDate(),
                transfer.getTransferId(),
                transfer.getPatient().getNationalId(),
                transfer.getPatient().getFullName(),
                transfer.getFromWard().getWardId(),
                transfer.getFromWard().getWardName(),
                transfer.getToWard().getWardId(),
                transfer.getToWard().getWardName(),
                transfer.getFromBedNumber(),
                transfer.getToBedNumber(),
                transfer.getTransferReason(),
                transfer.getOldAdmission().getAdmissionId(),
                transfer.getNewAdmission().getAdmissionId()
                );
    }

}
