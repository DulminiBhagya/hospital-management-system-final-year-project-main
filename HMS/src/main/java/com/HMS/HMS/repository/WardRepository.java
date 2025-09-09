package com.HMS.HMS.repository;

import com.HMS.HMS.model.ward.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WardRepository extends JpaRepository<Ward,Long> {

    List<Ward> findByWardType(String wardType);

    @Query("SELECT w FROM Ward w WHERE w.wardId = :wardId")
    Ward findByWardId(@Param("wardId") Long wardId);
}
