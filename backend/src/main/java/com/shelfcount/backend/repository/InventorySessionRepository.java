package com.shelfcount.backend.repository;

import com.shelfcount.backend.model.InventorySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventorySessionRepository
        extends JpaRepository<InventorySession, Long> {

    List<InventorySession> findAllByOrderByCreatedAtDesc();
}