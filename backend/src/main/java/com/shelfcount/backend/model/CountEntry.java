package com.shelfcount.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

@Entity
@Table(name = "count_entries")
public class CountEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "inventory_session_id", nullable = false)
    private InventorySession inventorySession;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Min(0)
    @Column(nullable = false)
    private Integer quantityFound;

    @Column(nullable = false)
    private LocalDateTime countedAt;

    public CountEntry() {
    }

    public CountEntry(
            InventorySession inventorySession,
            Item item,
            Location location,
            Integer quantityFound,
            LocalDateTime countedAt
    ) {
        this.inventorySession = inventorySession;
        this.item = item;
        this.location = location;
        this.quantityFound = quantityFound;
        this.countedAt = countedAt;
    }

    public Long getId() {
        return id;
    }

    public InventorySession getInventorySession() {
        return inventorySession;
    }

    public void setInventorySession(InventorySession inventorySession) {
        this.inventorySession = inventorySession;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public Integer getQuantityFound() {
        return quantityFound;
    }

    public void setQuantityFound(Integer quantityFound) {
        this.quantityFound = quantityFound;
    }

    public LocalDateTime getCountedAt() {
        return countedAt;
    }

    public void setCountedAt(LocalDateTime countedAt) {
        this.countedAt = countedAt;
    }
}