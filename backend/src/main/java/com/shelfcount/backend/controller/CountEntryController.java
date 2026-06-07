package com.shelfcount.backend.controller;

import com.shelfcount.backend.dto.CreateCountEntryRequest;
import com.shelfcount.backend.dto.ItemCountSummary;
import com.shelfcount.backend.model.CountEntry;
import com.shelfcount.backend.model.Item;
import com.shelfcount.backend.model.Location;
import com.shelfcount.backend.repository.CountEntryRepository;
import com.shelfcount.backend.repository.ItemRepository;
import com.shelfcount.backend.repository.LocationRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class CountEntryController {

    private final CountEntryRepository countEntryRepository;
    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;

    public CountEntryController(
            CountEntryRepository countEntryRepository,
            ItemRepository itemRepository,
            LocationRepository locationRepository
    ) {
        this.countEntryRepository = countEntryRepository;
        this.itemRepository = itemRepository;
        this.locationRepository = locationRepository;
    }

    @PostMapping("/api/count-entries")
    public CountEntry createCountEntry(@Valid @RequestBody CreateCountEntryRequest request) {
        Item item = itemRepository.findById(request.getItemId())
            .orElseThrow(() -> new RuntimeException("Item not found"));

        Location location = locationRepository.findById(request.getLocationId())
            .orElseThrow(() -> new RuntimeException("Location not found"));

        CountEntry countEntry = countEntryRepository
            .findByItemIdAndLocationId(item.getId(), location.getId())
            .orElseGet(() -> new CountEntry(
                    item,
                    location,
                    0,
                    LocalDateTime.now()
            ));

        countEntry.setQuantityFound(request.getQuantityFound());
        countEntry.setCountedAt(LocalDateTime.now());

        return countEntryRepository.save(countEntry);
    }
    @GetMapping("/api/items/{itemId}/count-entries")
    public List<CountEntry> getCountEntriesForItem(@PathVariable Long itemId) {
        return countEntryRepository.findByItemIdOrderByCountedAtDesc(itemId);
    }

    @GetMapping("/api/items/{itemId}/count-summary")
    public ItemCountSummary getCountSummaryForItem(@PathVariable Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        List<CountEntry> countEntries = countEntryRepository.findByItemIdOrderByCountedAtDesc(itemId);

        int totalFound = countEntries.stream()
                .mapToInt(CountEntry::getQuantityFound)
                .sum();

        int variance = totalFound - item.getExpectedQuantity();

        String status;

        if (totalFound == 0) {
            status = "Not Counted";
        } else if (variance == 0) {
            status = "Matched";
        } else if (variance < 0) {
            status = "Short";
        } else {
            status = "Over";
        }

        return new ItemCountSummary(
                item.getId(),
                item.getSerialNumber(),
                item.getName(),
                item.getExpectedQuantity(),
                totalFound,
                variance,
                status
        );
    }
}