package com.HMS.HMS.Exception_Handler;

public class DuplicateBatchNumberException extends RuntimeException{
    public DuplicateBatchNumberException(String batch){
        super("Batch number already exists: "+batch);
    }
}
