package com.HMS.HMS.repository.reports;

import com.HMS.HMS.model.Admission.Admission;
import com.HMS.HMS.repository.projection.MonthlyAdmissionsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdmissionsReportRepository extends JpaRepository<Admission,Long> {
    @Query(value = """
        WITH RECURSIVE months(m) AS (
            SELECT 1
            UNION ALL SELECT m + 1 FROM months WHERE m < 12
        )
        SELECT
            DATE_FORMAT(STR_TO_DATE(CONCAT(:year,'-',LPAD(m,2,'0'),'-01'), '%Y-%m-%d'), '%Y-%m') AS month,
            w.ward_id      AS wardId,
            w.ward_name    AS wardName,
            w.ward_type    AS wardType,
            CAST(COUNT(a.admission_id) AS UNSIGNED) AS totalAdmissions
        FROM months
        CROSS JOIN ward w
        LEFT JOIN admission a
          ON a.ward_id = w.ward_id
         AND YEAR(a.admission_date) = :year
         AND MONTH(a.admission_date) = m
        GROUP BY month, w.ward_id, w.ward_name, w.ward_type
        ORDER BY month, w.ward_name
        """, nativeQuery = true)
    List<MonthlyAdmissionsProjection> findYearlyMonthlyAdmissionsByWard(@Param("year") int year);
}
