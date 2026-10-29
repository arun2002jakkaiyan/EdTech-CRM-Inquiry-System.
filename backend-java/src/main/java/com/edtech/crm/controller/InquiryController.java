package com.edtech.crm.controller;

import com.edtech.crm.dto.ApiResponse;
import com.edtech.crm.dto.InquiryRequest;
import com.edtech.crm.dto.NotesUpdateRequest;
import com.edtech.crm.dto.StatusUpdateRequest;
import com.edtech.crm.entity.Inquiry;
import com.edtech.crm.repository.InquiryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryRepository inquiryRepository;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    public InquiryController(InquiryRepository inquiryRepository) {
        this.inquiryRepository = inquiryRepository;
    }

    /**
     * Submit Public Inquiry Form
     * Route: POST /api/inquiries
     * Public Route
     */
    @PostMapping
    public ResponseEntity<?> createInquiry(@Valid @RequestBody InquiryRequest request) {
        Inquiry inquiry = new Inquiry(
                request.getUser_type(),
                request.getCategory(),
                request.getName().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPhone().trim(),
                request.getMessage().trim()
        );

        Inquiry saved = inquiryRepository.save(inquiry);

        ApiResponse<Inquiry> response = new ApiResponse<>(
                true,
                "Inquiry submitted successfully! Our EdTech team will reach out to you shortly.",
                saved
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all inquiries with Category, User Type, Status Filters, Search & Metrics
     * Route: GET /api/inquiries
     * Protected Route (Admin only via JWT)
     */
    @GetMapping
    public ResponseEntity<?> getInquiries(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String user_type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        List<Inquiry> inquiries = inquiryRepository.findWithFilters(category, user_type, status, search);

        // Compute metrics
        long total = inquiryRepository.count();
        long pending = inquiryRepository.countByStatus("Pending");
        long inProgress = inquiryRepository.countByStatus("In Progress");
        long contacted = inquiryRepository.countByStatus("Contacted");
        long resolved = inquiryRepository.countByStatus("Resolved");

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        long today = inquiryRepository.countByCreatedAtAfter(startOfDay);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("total", total);
        metrics.put("pending", pending);
        metrics.put("in_progress", inProgress);
        metrics.put("contacted", contacted);
        metrics.put("resolved", resolved);
        metrics.put("today", today);

        boolean isPostgres = datasourceUrl != null && datasourceUrl.contains("postgresql");
        Map<String, Object> dbInfo = new HashMap<>();
        dbInfo.put("provider", isPostgres ? "Supabase PostgreSQL" : "Interactive Demo Database");
        dbInfo.put("mode", isPostgres ? "supabase-postgres" : "h2-postgres-compatible");
        dbInfo.put("connected", true);

        ApiResponse<List<Inquiry>> response = new ApiResponse<>(true, "Inquiries retrieved successfully", inquiries);
        response.setCount(inquiries.size());
        response.setMetrics(metrics);
        response.setDatabase(dbInfo);

        return ResponseEntity.ok(response);
    }

    /**
     * Update Inquiry Status
     * Route: PATCH /api/inquiries/{id}/status
     * Protected Route (Admin only via JWT)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusUpdateRequest request) {
        Inquiry inquiry = inquiryRepository.findById(id).orElse(null);

        if (inquiry == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Inquiry not found"));
        }

        inquiry.setStatus(request.getStatus());
        inquiry.setUpdatedAt(LocalDateTime.now());
        Inquiry updated = inquiryRepository.save(inquiry);

        return ResponseEntity.ok(new ApiResponse<>(true, "Inquiry status updated to " + request.getStatus(), updated));
    }

    /**
     * Update Inquiry Notes
     * Route: PATCH /api/inquiries/{id}/notes
     * Protected Route (Admin only via JWT)
     */
    @PatchMapping("/{id}/notes")
    public ResponseEntity<?> updateNotes(@PathVariable UUID id, @RequestBody NotesUpdateRequest request) {
        Inquiry inquiry = inquiryRepository.findById(id).orElse(null);

        if (inquiry == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Inquiry not found"));
        }

        inquiry.setNotes(request.getNotes() != null ? request.getNotes() : "");
        inquiry.setUpdatedAt(LocalDateTime.now());
        Inquiry updated = inquiryRepository.save(inquiry);

        return ResponseEntity.ok(new ApiResponse<>(true, "Inquiry notes updated successfully", updated));
    }

    /**
     * Delete Inquiry
     * Route: DELETE /api/inquiries/{id}
     * Protected Route (Admin only via JWT)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInquiry(@PathVariable UUID id) {
        if (!inquiryRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Inquiry not found or already deleted"));
        }

        inquiryRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Inquiry deleted successfully", id));
    }
}
