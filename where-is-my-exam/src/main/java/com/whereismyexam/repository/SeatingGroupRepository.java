package com.whereismyexam.repository;

import com.whereismyexam.entity.SeatingGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface SeatingGroupRepository extends JpaRepository<SeatingGroup, Long> {
    List<SeatingGroup> findByExamDateAndSession(LocalDate examDate, String session);

    List<SeatingGroup> findByExamDate(LocalDate examDate);

    @Query("SELECT COALESCE(SUM(s.strength), 0) FROM SeatingGroup s")
    long sumStrength();
}
