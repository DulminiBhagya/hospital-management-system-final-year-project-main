package com.HMS.HMS.controller.reports;

import com.HMS.HMS.DTO.reports.MedicationCategorySummaryDTO;
import com.HMS.HMS.DTO.reports.MedicationInventoryReportDTO;
import com.HMS.HMS.service.reports.MedicationReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports/medications")
public class MedicationReportController {

    private final MedicationReportService reportService;

    public MedicationReportController(MedicationReportService reportService) {
        this.reportService = reportService;
    }

    // JSON Data Endpoints
    @GetMapping("/inventory")
    public ResponseEntity<List<MedicationInventoryReportDTO>> getInventoryData() {
        List<MedicationInventoryReportDTO> data = reportService.getInventoryReportData();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<MedicationInventoryReportDTO>> getLowStockData() {
        List<MedicationInventoryReportDTO> data = reportService.getLowStockReportData();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<MedicationInventoryReportDTO>> getExpiringData(
            @RequestParam(defaultValue = "30") int daysAhead) {
        List<MedicationInventoryReportDTO> data = reportService.getExpiringMedicationsReportData(daysAhead);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/category-summary")
    public ResponseEntity<List<MedicationCategorySummaryDTO>> getCategorySummary() {
        List<MedicationCategorySummaryDTO> data = reportService.getCategorySummaryData();
        return ResponseEntity.ok(data);
    }

    // PDF Report Endpoints
    @GetMapping(value = "/inventory/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getInventoryReportPdf(
            @RequestParam(required = false) String preparedBy) {
        try {
            byte[] pdf = reportService.generateInventoryReportPdf("inventory", preparedBy);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=medication_inventory_report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/low-stock/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getLowStockReportPdf(
            @RequestParam(required = false) String preparedBy) {
        try {
            byte[] pdf = reportService.generateInventoryReportPdf("lowstock", preparedBy);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=medication_low_stock_report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/expiring/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getExpiringReportPdf(
            @RequestParam(required = false) String preparedBy,
            @RequestParam(defaultValue = "30") int daysAhead) {
        try {
            byte[] pdf = reportService.generateInventoryReportPdf("expiring", preparedBy);
            String filename = String.format("medication_expiring_%d_days_report.pdf", daysAhead);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/category-summary/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getCategorySummaryPdf(
            @RequestParam(required = false) String preparedBy) {
        try {
            byte[] pdf = reportService.generateCategorySummaryPdf(preparedBy);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=medication_category_summary.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Combined Annual Report
    @GetMapping(value = "/annual/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getAnnualReportPdf(
            @RequestParam int year,
            @RequestParam(required = false) String preparedBy) {
        try {
            // For now, return inventory report - can be enhanced to include year-based data
            byte[] pdf = reportService.generateInventoryReportPdf("inventory", preparedBy);
            String filename = String.format("medication_annual_report_%d.pdf", year);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}