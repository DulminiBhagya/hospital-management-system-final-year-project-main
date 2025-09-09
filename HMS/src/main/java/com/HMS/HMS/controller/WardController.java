package com.HMS.HMS.controller;

import com.HMS.HMS.DTO.WardDTO.BasicWardDTO;
import com.HMS.HMS.model.ward.Ward;
import com.HMS.HMS.repository.WardRepository;
import com.HMS.HMS.service.WardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wards")
public class WardController {

    private final WardService wardService;

    public WardController(WardService wardService) {
        this.wardService = wardService;
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<BasicWardDTO>> getAllWards(){
        return ResponseEntity.ok(wardService.getAllWards());
    }
}
