package com.whereismyexam.repository;

import com.whereismyexam.entity.DownloadHistory;
import com.whereismyexam.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DownloadHistoryRepository extends JpaRepository<DownloadHistory, Long> {
    // Find all downloads for a specific user, sorted by the most recent first
    List<DownloadHistory> findByUserOrderByDownloadedAtDesc(User user);
}
