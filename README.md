# ShelfCount Inventory System

ShelfCount is a full-stack inventory counting and reconciliation application designed to improve the annual physical inventory process in a bookstore environment.

## Problem

The current inventory-count process relies on printed sheets containing item serial numbers, item names, and expected quantities. Staff must manually search through these sheets while counting items across different store locations, making the process slow and prone to errors.

## Proposed Solution

ShelfCount will allow inventory staff to:

- Search for items using a serial number, SKU, ISBN, or barcode
- View expected stock quantities
- Record physical counts by store location
- Automatically combine counts from multiple locations
- Compare physical counts against expected quantities
- Identify missing, over-counted, and matched items
- Generate final inventory discrepancy reports

## Planned Technology Stack

- Frontend: React and TypeScript
- Backend: Java and Spring Boot
- Database: PostgreSQL
- Development Environment: Docker
- Version Control: Git and GitHub