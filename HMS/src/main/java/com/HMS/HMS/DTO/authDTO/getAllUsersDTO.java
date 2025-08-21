package com.HMS.HMS.DTO.authDTO;

public class getAllUsersDTO {
    private String empId;
    private String username;
    private String role;

    public getAllUsersDTO() {
    }

    public getAllUsersDTO(String empId, String username, String role) {
        this.empId = empId;
        this.username = username;
        this.role = role;
    }

    public String getEmpId() {
        return empId;
    }

    public void setEmpId(String empId) {
        this.empId = empId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
