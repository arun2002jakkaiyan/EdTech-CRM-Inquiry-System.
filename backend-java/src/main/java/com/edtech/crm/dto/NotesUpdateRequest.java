package com.edtech.crm.dto;

public class NotesUpdateRequest {
    private String notes;

    public NotesUpdateRequest() {}

    public NotesUpdateRequest(String notes) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
