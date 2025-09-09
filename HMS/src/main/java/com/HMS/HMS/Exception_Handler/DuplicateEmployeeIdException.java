package com.HMS.HMS.Exception_Handler;

public class DuplicateEmployeeIdException extends RuntimeException{
    public DuplicateEmployeeIdException(String message){
        super(message);
    }
}
