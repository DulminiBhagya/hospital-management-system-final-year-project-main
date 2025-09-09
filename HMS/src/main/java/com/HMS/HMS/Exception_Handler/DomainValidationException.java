package com.HMS.HMS.Exception_Handler;

public class DomainValidationException extends RuntimeException{
    public DomainValidationException(String message){
        super(message);
    }
}
