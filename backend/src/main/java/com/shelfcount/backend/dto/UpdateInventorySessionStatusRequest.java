package com.shelfcount.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateInventorySessionStatusRequest {

    @NotBlank
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}