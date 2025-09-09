package com.HMS.HMS.DTO.authDTO;

public class AuthRequest {

    private String empId;
    private String password;

    public AuthRequest() {
    }

    public AuthRequest(String empId, String password) {
        this.empId = empId;
        this.password = password;
    }

    public String getEmpId() {
        return empId;
    }

    public void setEmpId(String empId) {
        this.empId = empId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
