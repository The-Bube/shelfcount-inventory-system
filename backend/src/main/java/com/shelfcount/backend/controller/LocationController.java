package com.shelfcount.backend.controller;

import com.shelfcount.backend.model.Location;
import com.shelfcount.backend.repository.LocationRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {

    private final LocationRepository locationRepository;

    public LocationController(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @GetMapping("/api/locations")
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }
}