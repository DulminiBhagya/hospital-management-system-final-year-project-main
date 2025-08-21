package com.HMS.HMS.model.User;

import jakarta.persistence.*;

@Entity
public class User {

    @Id
    private String empId;
    private String username;
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role",length = 50)
    private Role role;

    public User() {
    }

    public User(String empId, String username, String password, Role role) {
        this.empId = empId;
        this.username = username;
        this.password = password;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
