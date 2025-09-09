package com.HMS.HMS.controller.reports;

import com.HMS.HMS.DTO.reports.MonthlyAdmissionsRequestDTO;
import com.HMS.HMS.DTO.reports.MonthlyAdmissionsRowDTO;
import com.HMS.HMS.service.reports.AdmissionsReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.awt.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports/admissions")
public class AdmissionsReportController {

    private final AdmissionsReportService service;

    public AdmissionsReportController(AdmissionsReportService service) {
        this.service = service;
    }

    @GetMapping("/yearly")
    public List<MonthlyAdmissionsRowDTO> yearlyJson(@RequestParam int year) {
        return service.getYearlyMonthlyAdmissions(year);
    }

    @GetMapping(value = "/yearly/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> yearlyPdf(
            @RequestParam int year,
            @RequestParam(required = false) String preparedBy) throws Exception {

        byte[] pdf = service.getYearlyMonthlyAdmissionsPdf(year, preparedBy);
        String fn = "yearly_monthly_admissions_by_ward_" + year + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fn)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
