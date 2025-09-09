package com.HMS.HMS.repository.projection;

public interface MonthlyAdmissionsProjection {
    String getMonth();           // "YYYY-MM"
    Long   getWardId();
    String getWardName();
    String getWardType();
    Long   getTotalAdmissions();
}
