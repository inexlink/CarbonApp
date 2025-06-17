# Carbon Emissions Calculator API

This is a Flask-based API that calculates carbon emissions for parts transportation, taking into account manufacturing emissions, local and global logistics, and equipment age. The API provides endpoints for retrieving manufacturer information, part details, and calculating emissions with route visualization.

## Features

- Calculate carbon emissions for parts transportation
- Support for both local and global logistics
- Route visualization using Folium maps
- Emission comparison charts
- Component-wise emission breakdown
- Manufacturer and parts database integration

## Prerequisites

- Python 3.8 or higher
- Node.js and npm (for frontend)
- SQLite3

## Setup Instructions

### 1. Backend Setup

1. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create the database:
```bash
# The database should be located at:
# backend/database_py/database/carbon.db
```

### 2. Frontend Setup

1. Install Node.js dependencies:
```bash
# change directory to /frontend and run 
npm install
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
# From the backend directory
python app.py
```

2. Start the frontend development server:
```bash
# From the project root
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### 1. Get Manufacturers
```http
GET /api/manufacturers
```
Returns a list of all manufacturers in the database.

### 2. Get Parts
```http
GET /api/parts?manufacturer={manufacturer_name}
```
Returns a list of parts for the specified manufacturer.

### 3. Calculate Emissions
```http
POST /api/calculate
```
Calculates emissions for part transportation.

Request body:
```json
{
    "manufacturer": "string",
    "part_name": "string",
    "serial_id": "string",
    "equipment_type": "Old" | "New",
    "pickup": "string",
    "delivery": "string",
    "G_pickup": "string",  // Optional
    "G_delivery": "string" // Optional
}
```

## Project Structure

```
project/
├── backend/
│   ├── app.py
│   ├── database_py/
│   │   └── database/
│   │       └── carbon.db
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Dependencies

### Backend Dependencies
```
flask==2.0.1
flask-cors==3.0.10
pandas==1.3.3
requests==2.26.0
folium==0.12.1
matplotlib==3.4.3
geopy==2.2.0
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.3.4",
    "chart.js": "^4.2.1",
    "react-chartjs-2": "^5.2.0"
  }
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
