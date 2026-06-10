# trexo-ecommerce

**TREXO** is an e-commerce recommendation engine project that provides a seamless user experience using a React (Vite) frontend and a Python FastAPI backend.

## Project Structure

- **Frontend:** React + Vite, styled with Tailwind CSS.
- **Backend:** FastAPI, using Pandas and Numpy to process a recommendation system. It uses a mock data mode or production data based on available datasets (`.csv` and `.pkl`).

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Python (v3.8 or higher recommended)

### Running the Frontend
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Running the Backend
1. Navigate to the `backend/` directory.
2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn pandas numpy
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:8000`.

## Features
- Dynamic recommendation engine based on Cosine Similarity.
- Fallback mock data mode if the machine learning model files are absent.
- Fast and responsive UI built with React and Tailwind CSS.
