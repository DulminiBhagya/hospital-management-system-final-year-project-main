package com.HMS.HMS.service.reports;

import com.HMS.HMS.DTO.reports.MonthlyAdmissionsRequestDTO;
import com.HMS.HMS.DTO.reports.MonthlyAdmissionsRowDTO;
import com.HMS.HMS.repository.projection.MonthlyAdmissionsProjection;
import com.HMS.HMS.repository.reports.AdmissionsReportRepository;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdmissionsReportService {

    private final AdmissionsReportRepository repo;
    private final ResourceLoader resourceLoader;


    public AdmissionsReportService(AdmissionsReportRepository repo, ResourceLoader resourceLoader) {
        this.repo = repo;
        this.resourceLoader = resourceLoader;
    }

    @Transactional(readOnly = true)
    public List<MonthlyAdmissionsRowDTO> getYearlyMonthlyAdmissions(int year) {
        List<MonthlyAdmissionsProjection> rows = repo.findYearlyMonthlyAdmissionsByWard(year);
        return rows.stream()
                .map(p -> new MonthlyAdmissionsRowDTO(
                        p.getWardId(),
                        p.getWardName(),
                        p.getWardType(),
                        p.getMonth(),
                        p.getTotalAdmissions()))
                .toList();
    }

    @Transactional(readOnly = true)
    public byte[] getYearlyMonthlyAdmissionsPdf(int year, String preparedBy) throws Exception {
        List<MonthlyAdmissionsRowDTO> data = getYearlyMonthlyAdmissions(year);

        String wardsCovered = data.stream()
                .map(MonthlyAdmissionsRowDTO::getWardName)
                .filter(n -> n != null && !n.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.joining(", "));

        InputStream jrxml = resourceLoader
                .getResource("classpath:reports/yearly_monthly_admissions_by_ward.jrxml")
                .getInputStream();
        JasperReport report = JasperCompileManager.compileReport(jrxml);

        Map<String, Object> params = new HashMap<>();
        params.put("hospitalName",    "National Institute for Nephrology, Dialysis & Transplantation");
        params.put("hospitalAddress", "No. xx, Colombo, Sri Lanka");
        params.put("hospitalContact", "+94 xx xxx xxxx");
        params.put("reportTitle",     "Yearly Monthly Patient Admissions by Ward");
        params.put("reportYear",      String.valueOf(year));
        params.put("preparedBy",      preparedBy != null ? preparedBy : "System");
        params.put("generatedOn",     LocalDate.now().toString());
        params.put("wardsCovered",    wardsCovered);
        // If you have a logo.png in resources/reports/, you can also pass it:
        // params.put("hospitalLogoPath", "reports/logo.png");

        JRBeanCollectionDataSource ds = new JRBeanCollectionDataSource(data);
        JasperPrint print = JasperFillManager.fillReport(report, params, ds);

        return JasperExportManager.exportReportToPdf(print);
    }
}
