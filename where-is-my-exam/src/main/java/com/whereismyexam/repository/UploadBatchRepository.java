package com.whereismyexam.repository;

import com.whereismyexam.entity.UploadBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadBatchRepository extends JpaRepository<UploadBatch, Long> {
}
