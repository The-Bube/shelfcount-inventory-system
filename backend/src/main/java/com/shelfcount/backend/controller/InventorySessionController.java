package com.shelfcount.backend.controller;

import com.shelfcount.backend.dto.CreateInventorySessionRequest;
import com.shelfcount.backend.dto.UpdateInventorySessionStatusRequest;
import com.shelfcount.backend.model.InventorySession;
import com.shelfcount.backend.repository.InventorySessionRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class InventorySessionController {

    private final InventorySessionRepository inventorySessionRepository;

    public InventorySessionController(
            InventorySessionRepository inventorySessionRepository
    ) {
        this.inventorySessionRepository = inventorySessionRepository;
    }

    @PostMapping("/api/inventory-sessions")
    public InventorySession createSession(
            @Valid @RequestBody CreateInventorySessionRequest request
    ) {
        InventorySession session = new InventorySession(
                request.getName().trim(),
                "ACTIVE",
                LocalDateTime.now()
        );

        return inventorySessionRepository.save(session);
    }

    @GetMapping("/api/inventory-sessions")
    public List<InventorySession> getAllSessions() {
        return inventorySessionRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/api/inventory-sessions/{sessionId}")
    public InventorySession getSessionById(@PathVariable Long sessionId) {
        return inventorySessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException(
                        "Inventory session not found"
                ));
    }

    @PatchMapping("/api/inventory-sessions/{sessionId}/status")
    public InventorySession updateSessionStatus(
            @PathVariable Long sessionId,
            @Valid @RequestBody UpdateInventorySessionStatusRequest request
    ) {
        InventorySession session = inventorySessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException(
                        "Inventory session not found"
                ));

        String newStatus = request.getStatus().trim().toUpperCase();

        if (
                !newStatus.equals("ACTIVE") &&
                !newStatus.equals("COMPLETED") &&
                !newStatus.equals("ARCHIVED")
        ) {
            throw new RuntimeException("Invalid inventory session status");
        }

        session.setStatus(newStatus);

        return inventorySessionRepository.save(session);
    }
}