package com.shelfcount.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateInventorySessionRequest {

    @NotBlank
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}