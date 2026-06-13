package com.whereismyexam.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class HistoryRequest {
    private String regNo;
    private LocalDate examDate;
    private String session;
}
