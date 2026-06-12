# TREXO - E-Commerce Recommendation Engine

**TREXO** is a modern e-commerce platform that integrates a machine-learning-based recommendation engine. It provides a seamless and responsive user experience using a React (Vite) frontend, paired with a high-performance Python FastAPI backend that serves content-based product recommendations.

## 🚀 Key Features

- **Dynamic Recommendation Engine**: Uses Content-Based Filtering (TF-IDF & Cosine Similarity) to suggest similar products based on brand, category, description, and specifications.
- **Mock & Production Data Modes**: The backend gracefully falls back to mock data if the machine learning model files are absent, allowing for easy local development.
- **Modern UI/UX**: Fast, responsive, and beautiful user interface built with React 19 and Tailwind CSS.
- **Supabase Integration**: Uses Supabase as the primary Database and Backend-as-a-Service for storing product catalogs.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **BaaS Client**: Supabase JS Client (`@supabase/supabase-js`)

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Data Processing**: Pandas, NumPy
- **Machine Learning**: Scikit-learn (TF-IDF Vectorizer, Linear Kernel for Cosine Similarity)
- **Database Connection**: Supabase Python Client

## 🧠 Machine Learning Architecture

The recommendation system uses a **Content-Based Filtering** approach:
1. **Data Fetching**: The `train_model.py` script fetches the product catalog from Supabase.
2. **Text Processing**: It combines `Product_Brand`, `Sub_Category`, `Description`, and `Specs` into a single text block for each product.
3. **Vectorization**: Scikit-learn's `TfidfVectorizer` converts the text into a matrix of TF-IDF features.
4. **Similarity Calculation**: A Cosine Similarity matrix is calculated using a linear kernel.
5. **Model Export**: The resulting similarity matrix and product ID mappings are exported as `.pkl` files (`recommendation_model.pkl` and `product_mapping.pkl`).
6. **API Serving**: The FastAPI backend loads these `.pkl` files and serves real-time recommendations via the `/api/recommend` endpoint.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Python (v3.8 or higher recommended)
- A Supabase account and project

### Environment Variables

#### Frontend (`.env` in root)
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

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
   *The frontend will run on `http://localhost:5173`.*

### Running the Backend
1. Navigate to the `backend/` directory.
2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn pandas numpy scikit-learn python-dotenv supabase
   ```
3. (Optional) Train the recommendation model:
   ```bash
   python train_model.py
   ```
   *This will generate `recommendation_model.pkl` and `product_mapping.pkl`.*
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will run on `http://localhost:8000`.*
