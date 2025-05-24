# Product Tracker Backend

This backend scrapes Amazon product details, stores price history in Firebase, and sends email alerts when a target price is reached.

## Endpoints

- `/api/track` — Add a product to track (by URL)
- `/api/product/{product_id}` — Get product details and price history
- `/api/alert` — Set a target price and email for notifications