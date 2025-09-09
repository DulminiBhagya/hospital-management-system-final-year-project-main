package com.HMS.HMS.DTO.WardDTO;

public class BasicWardDTO {
    private Long wardId;
    private String wardName;
    private String wardType;

    public BasicWardDTO(Long wardId, String wardName, String wardType) {
        this.wardId = wardId;
        this.wardName = wardName;
        this.wardType = wardType;
    }

    // getters
    public Long getWardId() {
        return wardId;
    }

    public String getWardName() {
        return wardName;
    }

    public String getWardType() {
        return wardType;
    }
}
