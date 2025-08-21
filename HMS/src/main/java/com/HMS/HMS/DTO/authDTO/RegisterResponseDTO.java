package com.HMS.HMS.DTO.authDTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegisterResponseDTO {

    @JsonProperty("isSuccess")  // This forces JSON key to be "isSuccess"
    private boolean isSuccess;

    private String message;

    public RegisterResponseDTO(boolean isSuccess, String message) {
        this.isSuccess = isSuccess;
        this.message = message;
    }

    @JsonProperty("isSuccess")
    public boolean isSuccess() {
        return isSuccess;
    }

    public void setSuccess(boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
