package com.HMS.HMS.DTO;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CommonResponseDTO {
    @JsonProperty("isSuccess")  // This forces JSON key to be "isSuccess"
    private boolean isSuccess;

    private String message;

    public CommonResponseDTO(boolean isSuccess, String message) {
        this.isSuccess = isSuccess;
        this.message = message;
    }

    public CommonResponseDTO(boolean b, String doctors_retrieved_successfully, Map<String, Object> responseData) {
        throw new UnsupportedOperationException("Not supported yet.");
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
