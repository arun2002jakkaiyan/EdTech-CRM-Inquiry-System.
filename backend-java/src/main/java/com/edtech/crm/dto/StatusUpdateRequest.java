package com.edtech.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class StatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(Pending|In Progress|Contacted|Resolved)$", message = "Status must be Pending, In Progress, Contacted, or Resolved")
    private String status;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
