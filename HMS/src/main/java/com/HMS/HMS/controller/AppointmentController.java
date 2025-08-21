package com.HMS.HMS.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.HMS.HMS.model.Appointment.Appointment;
import com.HMS.HMS.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<Appointment> scheduleAppointment(@RequestBody AppointmentRequest request) {
        try {
            Appointment appointment = appointmentService.scheduleAppointment(
                    request.getDoctorId(),
                    request.getPatientId(),
                    request.getDate(),
                    request.getTime()
            );
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsForDoctor(
            @PathVariable Long doctorId, 
            @RequestParam String date) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsForDoctor(doctorId, LocalDate.parse(date));
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    public static class AppointmentRequest {
        private Long doctorId;
        private Long patientId;
        private LocalDate date;
        private String time;

        public AppointmentRequest() {
        }

        public AppointmentRequest(Long doctorId, Long patientId, LocalDate date, String time) {
            this.doctorId = doctorId;
            this.patientId = patientId;
            this.date = date;
            this.time = time;
        }

        public Long getDoctorId() {
            return doctorId;
        }

        public void setDoctorId(Long doctorId) {
            this.doctorId = doctorId;
        }

        public Long getPatientId() {
            return patientId;
        }

        public void setPatientId(Long patientId) {
            this.patientId = patientId;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }
    }
}