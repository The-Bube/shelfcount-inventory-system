package com.shelfcount.backend.repository;

import com.shelfcount.backend.model.CountEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CountEntryRepository extends JpaRepository<CountEntry, Long> {

    List<CountEntry> findByItemIdOrderByCountedAtDesc(Long itemId);

    Optional<CountEntry> findByItemIdAndLocationId(Long itemId, Long locationId);
}