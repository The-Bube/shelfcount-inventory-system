package com.shelfcount.backend.controller;

import com.shelfcount.backend.model.Item;
import com.shelfcount.backend.repository.ItemRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ItemController {

    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @GetMapping("/api/items")
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/api/items/search")
    public List<Item> searchItems(@RequestParam String query) {
        return itemRepository
                .findBySerialNumberContainingIgnoreCaseOrNameContainingIgnoreCaseOrBarcodeContainingIgnoreCase(
                        query,
                        query,
                        query
                );
    }

    @GetMapping("/api/items/serial/{serialNumber}")
    public Item getItemBySerialNumber(@PathVariable String serialNumber) {
        return itemRepository.findBySerialNumberIgnoreCase(serialNumber)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }
}