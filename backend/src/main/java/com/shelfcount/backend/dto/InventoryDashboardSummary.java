package com.shelfcount.backend.dto;

public class InventoryDashboardSummary {

    private long totalItems;
    private long matchedItems;
    private long shortItems;
    private long overItems;
    private long notCountedItems;

    public InventoryDashboardSummary(
            long totalItems,
            long matchedItems,
            long shortItems,
            long overItems,
            long notCountedItems
    ) {
        this.totalItems = totalItems;
        this.matchedItems = matchedItems;
        this.shortItems = shortItems;
        this.overItems = overItems;
        this.notCountedItems = notCountedItems;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public long getMatchedItems() {
        return matchedItems;
    }

    public long getShortItems() {
        return shortItems;
    }

    public long getOverItems() {
        return overItems;
    }

    public long getNotCountedItems() {
        return notCountedItems;
    }
}