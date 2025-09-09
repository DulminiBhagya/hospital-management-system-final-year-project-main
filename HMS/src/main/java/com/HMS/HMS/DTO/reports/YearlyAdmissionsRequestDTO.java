package com.HMS.HMS.DTO.reports;

public class YearlyAdmissionsRequestDTO {
    private int year;
    private String preparedBy;

    public YearlyAdmissionsRequestDTO() {
    }

    public YearlyAdmissionsRequestDTO(int year, String preparedBy) {
        this.year = year;
        this.preparedBy = preparedBy;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public String getPreparedBy() {
        return preparedBy;
    }

    public void setPreparedBy(String preparedBy) {
        this.preparedBy = preparedBy;
    }
}
