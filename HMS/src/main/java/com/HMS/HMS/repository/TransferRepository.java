package com.HMS.HMS.repository;

import com.HMS.HMS.model.Transfer.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer,Long> {
    List<Transfer> findByPatientNationalId(Long nationalId);
    List<Transfer> findByFromWardWardId(Long wardId);
    List<Transfer> findByToWardWardId(Long wardId);

    @Query("SELECT t FROM Transfer t WHERE t.transferDate BETWEEN :startDate AND :endDate")
    List<Transfer> findTransfersBetweenDates(@Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transfer t WHERE t.patient.nationalId = :nationalId ORDER BY t.transferDate DESC")
    List<Transfer> findPatientTransferHistory(@Param("nationalId") Long nationalId);

}
