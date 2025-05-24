# Pulse Price Tracker Frontend

This is the frontend for the Pulse Price Tracker application, built with React and Vite.

## Features

- Search for Amazon products by URL
- View product details and price history
- Set up email alerts for price drops
- Real-time price history chart

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

The application will be available at http://localhost:5173.

## Building for Production

To create a production build:

```
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

- `src/components/`: React components
  - `HomePage.jsx`: Landing page with search functionality
  - `ProductPage.jsx`: Product details and price history chart
- `src/App.jsx`: Main application component with routing
- `src/main.jsx`: Application entry point

## Technologies Used

- React
- React Router
- Chart.js (via react-chartjs-2)
- Axios for API requests
- CSS for styling
