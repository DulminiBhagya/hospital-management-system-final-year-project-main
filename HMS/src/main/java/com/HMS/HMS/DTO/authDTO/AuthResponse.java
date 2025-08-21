package com.HMS.HMS.DTO.authDTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {

    @JsonProperty("isSuccess")
    private boolean isSuccess;
    private String message;
    private String jwtToken;

    public AuthResponse() {}

    public AuthResponse(boolean isSuccess, String message, String jwtToken) {
        this.isSuccess = isSuccess;
        this.message = message;
        this.jwtToken = jwtToken;
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

    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }
}
