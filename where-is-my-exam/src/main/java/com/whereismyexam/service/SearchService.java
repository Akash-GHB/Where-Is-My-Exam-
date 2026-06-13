package com.whereismyexam.service;

import com.whereismyexam.entity.SeatingGroup;
import com.whereismyexam.repository.SeatingGroupRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SearchService {
    private final SeatingGroupRepository repo;

    public SearchService(SeatingGroupRepository repo) {
        this.repo = repo;
    }

    public Optional<SeatingGroup> findByRegister(String regNo, LocalDate date, String session) {
        if (regNo == null) return Optional.empty();
        String r = regNo.trim().replaceAll("\\D", ""); // keep digits only
        if (r.isEmpty()) return Optional.empty();

        long regLong;
        try {
            regLong = Long.parseLong(r);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }

        List<SeatingGroup> groups = repo.findByExamDateAndSession(date, session.toUpperCase().trim());
        for (SeatingGroup g : groups) {
            try {
                String fromS = g.getRegFrom() == null ? "" : g.getRegFrom().replaceAll("\\D", "");
                String toS   = g.getRegTo()   == null ? "" : g.getRegTo().replaceAll("\\D", "");
                if (fromS.isEmpty() || toS.isEmpty()) continue;
                long from = Long.parseLong(fromS);
                long to   = Long.parseLong(toS);
                if (regLong >= from && regLong <= to) {
                    return Optional.of(g);
                }
            } catch (Exception ex) {
                // ignore malformed row
            }
        }
        return Optional.empty();
    }
}
