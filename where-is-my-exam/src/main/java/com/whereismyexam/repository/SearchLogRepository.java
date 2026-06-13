package com.whereismyexam.repository;

import com.whereismyexam.entity.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
    List<SearchLog> findFirst20ByOrderByTimestampDesc();
    
    Page<SearchLog> findAllByOrderByTimestampDesc(Pageable pageable);

    @Query(value = "SELECT reg_no, COUNT(*) as count FROM search_log GROUP BY reg_no ORDER BY count DESC LIMIT 10", nativeQuery = true)
    List<Object[]> findMostSearched();
}
