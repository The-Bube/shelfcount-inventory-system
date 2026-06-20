package com.shelfcount.backend.controller;

import com.shelfcount.backend.dto.InventoryDashboardSummary;
import com.shelfcount.backend.model.CountEntry;
import com.shelfcount.backend.model.Item;
import com.shelfcount.backend.repository.CountEntryRepository;
import com.shelfcount.backend.repository.ItemRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DashboardController {

    private final ItemRepository itemRepository;
    private final CountEntryRepository countEntryRepository;

    public DashboardController(
            ItemRepository itemRepository,
            CountEntryRepository countEntryRepository
    ) {
        this.itemRepository = itemRepository;
        this.countEntryRepository = countEntryRepository;
    }

    @GetMapping("/api/inventory-sessions/{sessionId}/dashboard/summary")
    public InventoryDashboardSummary getDashboardSummary(@PathVariable Long sessionId) {
        List<Item> items = itemRepository.findAll();

        long matchedItems = 0;
        long shortItems = 0;
        long overItems = 0;
        long notCountedItems = 0;

        for (Item item : items) {
            List<CountEntry> countEntries =
                    countEntryRepository.findByInventorySessionIdAndItemIdOrderByCountedAtDesc(
                            sessionId,
                            item.getId()
                    );

            int totalFound = countEntries.stream()
                    .mapToInt(CountEntry::getQuantityFound)
                    .sum();

            int variance = totalFound - item.getExpectedQuantity();

            if (countEntries.isEmpty()) {
                notCountedItems++;
            } else if (variance == 0) {
                matchedItems++;
            } else if (variance < 0) {
                shortItems++;
            } else {
                overItems++;
            }
        }

        return new InventoryDashboardSummary(
                items.size(),
                matchedItems,
                shortItems,
                overItems,
                notCountedItems
        );
    }
}