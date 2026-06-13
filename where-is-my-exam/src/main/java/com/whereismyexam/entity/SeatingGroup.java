package com.whereismyexam.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "seating_group")
public class SeatingGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // maps to DB column `no_`
    @Column(name = "no_")
    private Integer no_;

    private String program;
    private String branch;

    @Column(name = "course_code")
    private String courseCode;

    @Column(name = "course_name")
    private String courseName;

    // stored as VARCHAR in DB (reg_from/reg_to)
    @Column(name = "reg_from")
    private String regFrom;

    @Column(name = "reg_to")
    private String regTo;

    private Integer strength;

    @Column(name = "room_no")
    private String roomNo;

    private String block;
    private String floor;

    @Column(name = "exam_date")
    private LocalDate examDate;

    private String session;

    private Double latitude;
    private Double longitude;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    @JsonBackReference
    private UploadBatch batch;

    // ------------ getters and setters ------------
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNo_() {
        return no_;
    }

    public void setNo_(Integer no_) {
        this.no_ = no_;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getRegFrom() {
        return regFrom;
    }

    public void setRegFrom(String regFrom) {
        this.regFrom = regFrom;
    }

    public String getRegTo() {
        return regTo;
    }

    public void setRegTo(String regTo) {
        this.regTo = regTo;
    }

    public Integer getStrength() {
        return strength;
    }

    public void setStrength(Integer strength) {
        this.strength = strength;
    }

    public String getRoomNo() {
        return roomNo;
    }

    public void setRoomNo(String roomNo) {
        this.roomNo = roomNo;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public String getSession() {
        return session;
    }

    public void setSession(String session) {
        this.session = session;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public UploadBatch getBatch() {
        return batch;
    }

    public void setBatch(UploadBatch batch) {
        this.batch = batch;
    }
}
