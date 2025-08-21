package com.HMS.HMS.Exception_Handler;

import com.HMS.HMS.DTO.authDTO.RegisterResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<RegisterResponseDTO> handleUserNotFound(UserNotFoundException ex){
        return new ResponseEntity<>(new RegisterResponseDTO(false,ex.getMessage()),HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<RegisterResponseDTO> handleInvalidPassword(InvalidPasswordException ex){
        return new ResponseEntity<>(new RegisterResponseDTO(false,ex.getMessage()),HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(EmployeeIdAlreadyExistsException.class)
    public ResponseEntity<RegisterResponseDTO> handleEmployeeIdExists(EmployeeIdAlreadyExistsException ex){
        return new ResponseEntity<>(new RegisterResponseDTO(false,ex.getMessage()),HttpStatus.CONFLICT);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RegisterResponseDTO> handleGenericException(Exception ex){
        return new ResponseEntity<>(new RegisterResponseDTO(false, "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
