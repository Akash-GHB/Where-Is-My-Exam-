package com.whereismyexam.service;

import com.whereismyexam.entity.SeatingGroup;
import com.whereismyexam.entity.UploadBatch;
import com.whereismyexam.repository.SeatingGroupRepository;
import com.whereismyexam.repository.UploadBatchRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class UploadService {

    private final SeatingGroupRepository seatingRepo;
    private final UploadBatchRepository batchRepo;

    public UploadService(SeatingGroupRepository seatingRepo, UploadBatchRepository batchRepo) {
        this.seatingRepo = seatingRepo;
        this.batchRepo = batchRepo;
    }

    public String uploadCsv(MultipartFile file, String uploadedBy, String description) {
        try {
            CSVParser parser = CSVParser.parse(
                    new InputStreamReader(file.getInputStream()),
                    CSVFormat.DEFAULT.withFirstRecordAsHeader().withTrim());

            UploadBatch batch = new UploadBatch();
            batch.setUploadedBy(uploadedBy);
            batch.setDescription(description);
            batch = batchRepo.save(batch);

            List<SeatingGroup> list = new ArrayList<>();

            for (CSVRecord r : parser) {
                SeatingGroup g = new SeatingGroup();
                // header names must match CSV:
                // no,program,branch,course_code,course_name,from,to,strength,room_no,block,floor,exam_date,session,lat,lng
                try {
                    g.setNo_(Integer.parseInt(r.get("no")));
                } catch (Exception e) {
                    g.setNo_(null);
                }
                g.setProgram(safe(r, "program"));
                g.setBranch(safe(r, "branch"));
                g.setCourseCode(safe(r, "course_code"));
                g.setCourseName(safe(r, "course_name"));
                g.setRegFrom(safe(r, "from"));
                g.setRegTo(safe(r, "to"));
                try {
                    g.setStrength(Integer.parseInt(r.get("strength")));
                } catch (Exception e) {
                    g.setStrength(null);
                }
                g.setRoomNo(safe(r, "room_no"));
                g.setBlock(safe(r, "block"));
                g.setFloor(safe(r, "floor"));
                String dateStr = safe(r, "exam_date");
                if (dateStr != null && !dateStr.isBlank()) {
                    g.setExamDate(LocalDate.parse(dateStr));
                }
                g.setSession(safe(r, "session"));
                try {
                    String latStr = safe(r, "lat");
                    if (latStr != null)
                        g.setLatitude(Double.parseDouble(latStr));
                    String lngStr = safe(r, "lng");
                    if (lngStr != null)
                        g.setLongitude(Double.parseDouble(lngStr));
                } catch (Exception e) {
                }
                g.setBatch(batch);
                list.add(g);
            }

            seatingRepo.saveAll(list);
            return "Uploaded " + list.size() + " rows successfully!";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    private String safe(CSVRecord r, String col) {
        try {
            return r.isMapped(col) ? r.get(col) : null;
        } catch (Exception ex) {
            return null;
        }
    }

    public List<com.whereismyexam.dto.BatchInfoDto> getAllBatches() {
        List<UploadBatch> batches = batchRepo.findAll(org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Direction.DESC, "uploadTime"));
        List<com.whereismyexam.dto.BatchInfoDto> result = new ArrayList<>();
        for (UploadBatch b : batches) {
            com.whereismyexam.dto.BatchInfoDto dto = new com.whereismyexam.dto.BatchInfoDto();
            dto.setId(b.getId());
            dto.setFileName(
                    b.getDescription() != null && !b.getDescription().isEmpty() ? b.getDescription() : "Data Upload");
            dto.setUploadedBy(b.getUploadedBy());
            dto.setUploadedAt(b.getUploadTime());
            dto.setDescription(b.getDescription());
            dto.setRecordCount(b.getEntries() != null ? b.getEntries().size() : 0);
            result.add(dto);
        }
        return result;
    }
}
