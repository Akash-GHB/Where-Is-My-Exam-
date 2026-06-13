package com.whereismyexam.controller;

import com.whereismyexam.repository.SearchLogRepository;
import com.whereismyexam.repository.SeatingGroupRepository;
import com.whereismyexam.repository.UploadBatchRepository;
import com.whereismyexam.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UploadBatchRepository uploadBatchRepository;

    @Mock
    private SearchLogRepository searchLogRepository;

    @Mock
    private SeatingGroupRepository seatingGroupRepository;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
    }

    @Test
    void testGetStats() throws Exception {
        when(userRepository.count()).thenReturn(100L);
        when(seatingGroupRepository.sumStrength()).thenReturn(500L);
        when(uploadBatchRepository.count()).thenReturn(10L);
        when(searchLogRepository.count()).thenReturn(250L);

        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(100))
                .andExpect(jsonPath("$.totalRecords").value(500))
                .andExpect(jsonPath("$.totalBatches").value(10))
                .andExpect(jsonPath("$.totalSearches").value(250));
    }
}
