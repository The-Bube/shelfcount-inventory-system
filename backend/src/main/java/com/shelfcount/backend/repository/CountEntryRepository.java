package com.shelfcount.backend.repository;

import com.shelfcount.backend.model.CountEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CountEntryRepository extends JpaRepository<CountEntry, Long> {

    List<CountEntry> findByItemIdOrderByCountedAtDesc(Long itemId);
}