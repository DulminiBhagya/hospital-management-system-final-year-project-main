package com.HMS.HMS.controller;

import com.HMS.HMS.DTO.transferDTO.TransferRequestDTO;
import com.HMS.HMS.DTO.transferDTO.TransferResponseDTO;
import com.HMS.HMS.service.TransferService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {
    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/instant")
    ResponseEntity<?> transferPatientInstantly(@RequestBody TransferRequestDTO request){
        try{
            TransferResponseDTO response = transferService.transferPatientInstantly(request);
            return ResponseEntity.ok(response);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }catch (IllegalStateException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: " + e.getMessage());
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: Failed to transfer patient - " + e.getMessage());
        }
    }

    @GetMapping("/patient/{nationalId}/history")
    public ResponseEntity<List<TransferResponseDTO>> getPatientTransferHistory(@PathVariable Long nationalId){
        List<TransferResponseDTO> transfers = transferService.getTransferHistory(nationalId);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/ward/{wardId}")
    public ResponseEntity<List<TransferResponseDTO>> getWardTransfers(@PathVariable Long wardId){
        List<TransferResponseDTO> transfers  = transferService.getWardTransfers(wardId);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/all")
    public ResponseEntity<List<TransferResponseDTO>> getAllTransfers(){
        List<TransferResponseDTO> transfers = transferService.getAllTransfers();
        return ResponseEntity.ok(transfers);
    }
}
