package com.shelfcount.backend.repository;

import com.shelfcount.backend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findBySerialNumberIgnoreCase(String serialNumber);

    List<Item> findBySerialNumberContainingIgnoreCaseOrNameContainingIgnoreCaseOrBarcodeContainingIgnoreCase(
            String serialNumber,
            String name,
            String barcode
    );
}