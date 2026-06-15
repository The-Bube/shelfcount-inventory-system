package com.shelfcount.backend.repository;

import com.shelfcount.backend.model.CountEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CountEntryRepository extends JpaRepository<CountEntry, Long> {

    List<CountEntry> findByInventorySessionIdAndItemIdOrderByCountedAtDesc(
            Long inventorySessionId,
            Long itemId
    );

    Optional<CountEntry> findByInventorySessionIdAndItemIdAndLocationId(
            Long inventorySessionId,
            Long itemId,
            Long locationId
    );

    void deleteByInventorySessionId(Long inventorySessionId);
}