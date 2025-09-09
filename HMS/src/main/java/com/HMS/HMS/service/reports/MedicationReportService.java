package com.HMS.HMS.service.reports;

import com.HMS.HMS.DTO.reports.MedicationCategorySummaryDTO;
import com.HMS.HMS.DTO.reports.MedicationInventoryReportDTO;
import com.HMS.HMS.model.Medication.Medication;
import com.HMS.HMS.repository.reports.MedicationReportRepository;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MedicationReportService {

    private final MedicationReportRepository repository;
    private final ResourceLoader resourceLoader;

    public MedicationReportService(MedicationReportRepository repository, ResourceLoader resourceLoader) {
        this.repository = repository;
        this.resourceLoader = resourceLoader;
    }

    @Transactional(readOnly = true)
    public List<MedicationInventoryReportDTO> getInventoryReportData() {
        List<Medication> medications = repository.findAllActiveMedicationsForReport();
        return medications.stream()
                .map(this::convertToReportDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationInventoryReportDTO> getLowStockReportData() {
        List<Medication> medications = repository.findLowStockMedicationsForReport();
        return medications.stream()
                .map(this::convertToReportDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationInventoryReportDTO> getExpiringMedicationsReportData(int daysAhead) {
        LocalDate expiryThreshold = LocalDate.now().plusDays(daysAhead);
        List<Medication> medications = repository.findExpiringMedicationsForReport(expiryThreshold);
        return medications.stream()
                .map(this::convertToReportDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationCategorySummaryDTO> getCategorySummaryData() {
        LocalDate expiryThreshold = LocalDate.now().plusDays(30);
        List<Object[]> results = repository.findCategorySummaryData(expiryThreshold);
        
        return results.stream()
                .map(row -> new MedicationCategorySummaryDTO(
                        (String) row[0],           // category
                        (Long) row[1],             // totalMedications
                        ((Long) row[2]).intValue(), // totalStock
                        ((Long) row[3]).intValue(), // lowStockCount
                        ((Long) row[4]).intValue(), // expiringSoonCount
                        (BigDecimal) row[5],       // totalValue
                        (BigDecimal) row[6]        // averageUnitCost
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] generateInventoryReportPdf(String reportType, String preparedBy) throws Exception {
        List<MedicationInventoryReportDTO> data;
        String templateName;
        String reportTitle;

        switch (reportType.toLowerCase()) {
            case "lowstock":
                data = getLowStockReportData();
                templateName = "medication_low_stock_report.jrxml";
                reportTitle = "Low Stock Medications Report";
                break;
            case "expiring":
                data = getExpiringMedicationsReportData(30);
                templateName = "medication_expiring_report.jrxml";
                reportTitle = "Expiring Medications Report (30 Days)";
                break;
            case "category":
                return generateCategorySummaryPdf(preparedBy);
            default:
                data = getInventoryReportData();
                templateName = "medication_inventory_report.jrxml";
                reportTitle = "Complete Medication Inventory Report";
        }

        // Load template
        InputStream templateStream = resourceLoader.getResource("classpath:reports/" + templateName).getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);

        // Prepare parameters
        Map<String, Object> parameters = createReportParameters(reportTitle, preparedBy);
        
        // Calculate summary statistics
        addInventoryStatistics(parameters, data);

        // Create data source
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);

        // Fill report
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        // Export to PDF
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

    @Transactional(readOnly = true)
    public byte[] generateCategorySummaryPdf(String preparedBy) throws Exception {
        List<MedicationCategorySummaryDTO> data = getCategorySummaryData();

        // Load template
        InputStream templateStream = resourceLoader.getResource("classpath:reports/medication_category_summary.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);

        // Prepare parameters
        Map<String, Object> parameters = createReportParameters("Medication Category Summary Report", preparedBy);
        
        // Add overall statistics
        Object[] stats = repository.findInventoryStatistics(LocalDate.now().plusDays(30));
        parameters.put("totalMedications", stats[0]);
        parameters.put("totalStock", stats[1]);
        parameters.put("totalValue", stats[2]);
        parameters.put("lowStockCount", stats[3]);
        parameters.put("expiringSoonCount", stats[4]);

        // Create data source
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);

        // Fill report
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        // Export to PDF
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

    private MedicationInventoryReportDTO convertToReportDTO(Medication medication) {
        String stockStatus = calculateStockStatus(medication);
        Long daysUntilExpiry = calculateDaysUntilExpiry(medication.getExpiryDate());
        BigDecimal totalValue = medication.getUnitCost().multiply(BigDecimal.valueOf(medication.getCurrentStock()));
        Boolean isLowStock = medication.getCurrentStock() <= medication.getMinimumStock();
        Boolean isExpiringSoon = daysUntilExpiry != null && daysUntilExpiry <= 30;

        return new MedicationInventoryReportDTO(
                medication.getId(),
                medication.getDrugName(),
                medication.getGenericName(),
                medication.getCategory(),
                medication.getStrength(),
                medication.getDosageForm(),
                medication.getManufacturer(),
                medication.getBatchNumber(),
                medication.getCurrentStock(),
                medication.getMinimumStock(),
                medication.getMaximumStock(),
                medication.getUnitCost(),
                medication.getExpiryDate(),
                medication.getCreatedAt(),
                stockStatus,
                daysUntilExpiry,
                totalValue,
                isLowStock,
                isExpiringSoon
        );
    }

    private String calculateStockStatus(Medication medication) {
        if (medication.getCurrentStock() == 0) return "OUT_OF_STOCK";
        if (medication.getCurrentStock() <= medication.getMinimumStock()) return "LOW_STOCK";
        if (medication.getCurrentStock() >= medication.getMaximumStock()) return "OVERSTOCK";
        return "NORMAL";
    }

    private Long calculateDaysUntilExpiry(LocalDate expiryDate) {
        if (expiryDate == null) return null;
        return ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    private Map<String, Object> createReportParameters(String reportTitle, String preparedBy) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("hospitalName", "General Hospital");
        parameters.put("hospitalAddress", "123 Healthcare Ave, Medical City");
        parameters.put("hospitalContact", "Phone: +1-555-0123 | Email: info@generalhospital.com");
        parameters.put("reportTitle", reportTitle);
        parameters.put("preparedBy", preparedBy != null ? preparedBy : "System Administrator");
        parameters.put("generatedOn", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return parameters;
    }

    private void addInventoryStatistics(Map<String, Object> parameters, List<MedicationInventoryReportDTO> data) {
        BigDecimal totalValue = data.stream()
                .map(MedicationInventoryReportDTO::getTotalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long lowStockCount = data.stream()
                .mapToLong(dto -> dto.getIsLowStock() ? 1 : 0)
                .sum();
        
        long expiringSoonCount = data.stream()
                .mapToLong(dto -> dto.getIsExpiringSoon() ? 1 : 0)
                .sum();

        parameters.put("totalInventoryValue", totalValue);
        parameters.put("lowStockAlerts", lowStockCount);
        parameters.put("expiringAlerts", expiringSoonCount);
        parameters.put("totalMedicationsInReport", data.size());
    }
}