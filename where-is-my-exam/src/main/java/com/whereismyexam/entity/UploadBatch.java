package com.whereismyexam.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "upload_batch")
public class UploadBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @Column(name = "upload_time")
    private LocalDateTime uploadTime;

    private String description;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SeatingGroup> entries = new ArrayList<>();

    // optional helper to set timestamp before persist
    @PrePersist
    public void prePersist() {
        if (uploadTime == null) {
            uploadTime = LocalDateTime.now();
        }
    }

    // ------------ getters and setters ------------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDateTime getUploadTime() { return uploadTime; }
    public void setUploadTime(LocalDateTime uploadTime) { this.uploadTime = uploadTime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<SeatingGroup> getEntries() { return entries; }
    public void setEntries(List<SeatingGroup> entries) { this.entries = entries; }

    public void addEntry(SeatingGroup e) {
        entries.add(e);
        e.setBatch(this);
    }

    public void removeEntry(SeatingGroup e) {
        entries.remove(e);
        e.setBatch(null);
    }
}
