package com.HMS.HMS.service;

import com.HMS.HMS.DTO.WardDTO.BasicWardDTO;
import com.HMS.HMS.model.ward.Ward;
import com.HMS.HMS.repository.WardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WardService {

    private final WardRepository wardRepository;

    public WardService(WardRepository wardRepository) {
        this.wardRepository = wardRepository;
    }

    public List<BasicWardDTO> getAllWards(){
        return wardRepository.findAll()
                .stream()
                .map(ward -> new BasicWardDTO(
                        ward.getWardId(),
                        ward.getWardName(),
                        ward.getWardType()
                ))
                .collect(Collectors.toList());
    }
}
