package com.shelfcount.backend.repository;

import com.shelfcount.backend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {

    Optional<Location> findByNameIgnoreCase(String name);
}