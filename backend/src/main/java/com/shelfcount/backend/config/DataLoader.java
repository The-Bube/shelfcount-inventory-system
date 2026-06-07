package com.shelfcount.backend.config;

import com.shelfcount.backend.model.Item;
import com.shelfcount.backend.repository.ItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadSampleItems(ItemRepository itemRepository) {
        return args -> {
            if (itemRepository.count() == 0) {
                itemRepository.save(new Item(
                        "BK-10345",
                        "Introduction to Java Programming",
                        "9780134670942",
                        "Textbook",
                        12
                ));

                itemRepository.save(new Item(
                        "BK-20482",
                        "Clean Code",
                        "9780132350884",
                        "Programming Book",
                        7
                ));

                itemRepository.save(new Item(
                        "MER-20012",
                        "Ontario Tech Hoodie Medium",
                        "MER20012",
                        "Merchandise",
                        8
                ));

                itemRepository.save(new Item(
                        "STA-90110",
                        "Blue Notebook",
                        "STA90110",
                        "Stationery",
                        25
                ));

                itemRepository.save(new Item(
                        "BK-77821",
                        "Database Systems Concepts",
                        "9780073523323",
                        "Textbook",
                        5
                ));
            }
        };
    }
}