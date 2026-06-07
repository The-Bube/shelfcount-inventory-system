package com.shelfcount.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateCountEntryRequest {

    @NotNull
    private Long itemId;

    @NotNull
    private Long locationId;

    @NotNull
    @Min(0)
    private Integer quantityFound;

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Integer getQuantityFound() {
        return quantityFound;
    }

    public void setQuantityFound(Integer quantityFound) {
        this.quantityFound = quantityFound;
    }
}