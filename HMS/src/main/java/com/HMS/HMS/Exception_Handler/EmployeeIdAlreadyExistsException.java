package com.HMS.HMS.Exception_Handler;

public class EmployeeIdAlreadyExistsException extends RuntimeException{
    public EmployeeIdAlreadyExistsException(String message){
        super(message);
    }
}
