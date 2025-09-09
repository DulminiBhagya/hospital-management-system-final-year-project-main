package com.HMS.HMS.controller;

import com.HMS.HMS.model.doctor.Doctor;
import com.HMS.HMS.service.DoctorService;
import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService){
        this.doctorService = doctorService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addDoctor(@RequestBody Doctor doctor){
        try{
            Doctor savedDoctor = doctorService.addDoctor(doctor);
            return new ResponseEntity<>(savedDoctor, HttpStatus.CREATED);
        }catch (IllegalArgumentException e){
            return new ResponseEntity<>("Registration failed: " + e.getMessage(), HttpStatus.CONFLICT);
        }catch (Exception e){
            return new ResponseEntity<>("Error adding doctor: "+ e.getMessage(),HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Doctor>> getAllDoctors(){
        List<Doctor> doctors = doctorService.getAllDoctors();
        return new ResponseEntity<>(doctors,HttpStatus.OK);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<?> getDoctorByEmployeeId(@PathVariable Long employeeId){
        Optional<Doctor> doctor = doctorService.getDoctorByEmployeeId(employeeId);
        if (doctor.isPresent()){
            return new ResponseEntity<>(doctor.get(),HttpStatus.OK);
        }
        return new ResponseEntity<>("Doctor not found with Employee ID: "+employeeId,HttpStatus.NOT_FOUND);
    }

    @PutMapping("/update/{employeeId}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long employeeId,@RequestBody Doctor doctorDetails){
        try{
            Doctor updatedDoctor = doctorService.updateDoctor(employeeId,doctorDetails);
            if (updatedDoctor != null){
                return new ResponseEntity<>(updatedDoctor,HttpStatus.OK);
            }
            return new ResponseEntity<>("Doctor not found with Employee ID: " + employeeId,
                    HttpStatus.NOT_FOUND);

        }catch (Exception e){
            return new ResponseEntity<>("Error updating doctor: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/delete/{employeeId}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long employeeId){
        boolean deleted = doctorService.deleteDoctor(employeeId);
        if (deleted){
            return new ResponseEntity<>("Doctor deleted successfully",HttpStatus.OK);
        }
        return new ResponseEntity<>("Doctor not found with Employee ID: "+employeeId,HttpStatus.NOT_FOUND);
    }
}
