package com.HMS.HMS.DTO.reports;

public class MonthlyAdmissionsRequestDTO {
    private Integer year;
    private Integer month;

    public MonthlyAdmissionsRequestDTO() {
    }

    public MonthlyAdmissionsRequestDTO(Integer year, Integer month) {
        this.year = year;
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }
}
