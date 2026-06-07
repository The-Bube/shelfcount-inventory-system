package com.shelfcount.backend.dto;

public class ItemCountSummary {

    private Long itemId;
    private String serialNumber;
    private String itemName;
    private Integer expectedQuantity;
    private Integer totalFound;
    private Integer variance;
    private String status;

    public ItemCountSummary(
            Long itemId,
            String serialNumber,
            String itemName,
            Integer expectedQuantity,
            Integer totalFound,
            Integer variance,
            String status
    ) {
        this.itemId = itemId;
        this.serialNumber = serialNumber;
        this.itemName = itemName;
        this.expectedQuantity = expectedQuantity;
        this.totalFound = totalFound;
        this.variance = variance;
        this.status = status;
    }

    public Long getItemId() {
        return itemId;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getItemName() {
        return itemName;
    }

    public Integer getExpectedQuantity() {
        return expectedQuantity;
    }

    public Integer getTotalFound() {
        return totalFound;
    }

    public Integer getVariance() {
        return variance;
    }

    public String getStatus() {
        return status;
    }
}