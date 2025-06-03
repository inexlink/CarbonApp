from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pandas as pd
import requests
import folium
import matplotlib.pyplot as plt
import io
import base64
from math import radians, sin, cos, sqrt, atan2
from geopy.geocoders import Nominatim
import os
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db_connection():
    """
    Establishes a connection to the SQLite database.
    
    Returns:
        sqlite3.Connection: A connection object to the database
        
    Raises:
        FileNotFoundError: If the database file is not found
        sqlite3.Error: If there's an error connecting to the database
    """
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'database_py', 'database', 'carbon.db')

    # print(" Absolute path to DB:", db_path)
    # print(" DB exists?", os.path.exists(db_path))

    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database not found at {db_path}")

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print("SQLite error:", e)
        raise

def geography(name):
    """
    Converts a location name to its geographical coordinates.
    
    Args:
        name (str): The name of the location to geocode
        
    Returns:
        tuple: A tuple containing (latitude, longitude)
        
    Raises:
        Exception: If geocoding fails
    """
    geolocator = Nominatim(user_agent="user1", timeout=20)
    location = geolocator.geocode(name)
    return (location.latitude, location.longitude)

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculates the great-circle distance between two points on the Earth's surface.
    
    Args:
        lat1 (float): Latitude of first point in degrees
        lon1 (float): Longitude of first point in degrees
        lat2 (float): Latitude of second point in degrees
        lon2 (float): Longitude of second point in degrees
        
    Returns:
        float: Distance between points in kilometers
    """
    R = 6371  # Earth's radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def distribution_centre(pickup, delivery, mode=""):
    """
    Calculates distribution information between pickup and delivery locations.
    
    Args:
        pickup (str): Name of the pickup location
        delivery (str): Name of the delivery location
        mode (str): Transport mode - "local" or "global"
        
    Returns:
        dict: Dictionary containing:
            - Olat: Origin latitude
            - Olon: Origin longitude
            - Dlat: Destination latitude
            - Dlon: Destination longitude
            - distance: Distance in kilometers
            - duration: Duration in hours
            
    Raises:
        ValueError: If mode is not "local" or "global"
    """
    origin = geography(pickup)
    destination = geography(delivery)

    result = {
        "Olat": origin[0],
        "Olon": origin[1],
        "Dlat": destination[0],
        "Dlon": destination[1],
        "distance": None,
        "duration": None
    }

    if mode == "local":
        origin_str = f"{origin[1]},{origin[0]}"
        destination_str = f"{destination[1]},{destination[0]}"
        url = f"http://router.project-osrm.org/route/v1/driving/{origin_str};{destination_str}?overview=false"
        response = requests.get(url)
        data = response.json()

        if 'routes' in data and len(data['routes']) > 0:
            route = data['routes'][0]
            result["distance"] = route['distance'] / 1000
            result["duration"] = route['duration'] / 3600
        else:
            result["distance"] = haversine(*origin, *destination)
            result["duration"] = result["distance"] / 50
    elif mode == "global":
        result["distance"] = haversine(*origin, *destination)
        result["duration"] = result["distance"] / 830
    else:
        raise ValueError("Invalid transport mode")

    return result

def calc_emission(weight, distance, fuel_factor=3.27):
    """
    Calculates carbon emissions for a given weight and distance.
    
    Args:
        weight (float): Weight of the cargo in kg
        distance (float): Distance in kilometers
        fuel_factor (float, optional): Fuel emission factor. Defaults to 3.27
        
    Returns:
        float: Total emissions in kg CO2
    """
    return weight * fuel_factor * distance

def get_chart_data(global_emission, local_emission):
    """
    Prepares data for emission comparison chart.
    
    Args:
        global_emission (float): Global transport emissions
        local_emission (float): Local transport emissions
        
    Returns:
        dict: Chart data with labels, values, and colors
    """
    return {
        'labels': ['Global Emission', 'Local Emission'],
        'values': [global_emission, local_emission],
        'colors': ['#ff6384', '#36a2eb']
    }


@app.route('/api/parts', methods=['GET'])
def get_part_names():
    """
    API endpoint to get part names for a specific manufacturer.
    
    Query Parameters:
        manufacturer (str): Name of the manufacturer
        
    Returns:
        JSON: List of dictionaries containing part names and serial IDs
        
    Status Codes:
        200: Success
        400: Missing manufacturer parameter
    """
    manufacturer = request.args.get('manufacturer')
    if not manufacturer:
        return jsonify({'error': 'Manufacturer is required'}), 400

    print(f"/api/parts route was hit with manufacturer: {manufacturer}")

    conn = get_db_connection()
    query = 'SELECT DISTINCT part_name, serial_id FROM inventory_parts WHERE manufacturer = ?'
    rows = conn.execute(query, (manufacturer,)).fetchall()
    conn.close()

    part_info = [{"part_name": row['part_name'], "serial_id": row['serial_id']} for row in rows]
    return jsonify(part_info)


@app.route('/api/manufacturers', methods=['GET'])
def get_manufacturers():
    """
    API endpoint to get list of all manufacturers.
    
    Returns:
        JSON: List of manufacturer names
    """
    conn = get_db_connection()
    rows = conn.execute('SELECT DISTINCT manufacturer FROM inventory_parts').fetchall()
    conn.close()
    return jsonify([row['manufacturer'] for row in rows])


@app.route('/api/calculate', methods=['POST'])
def calculate_emissions():
    """
    API endpoint to calculate emissions for a part's transportation.
    
    Request Body:
        manufacturer (str): Name of the manufacturer
        part_name (str): Name of the part
        serial_id (str): Serial ID of the part
        equipment_type (str): Type of equipment ('Old' or 'New')
        pickup (str): Local pickup location
        delivery (str): Local delivery location
        G_pickup (str, optional): Global pickup location
        G_delivery (str, optional): Global delivery location
        
    Returns:
        JSON: Dictionary containing:
            - weight: Part weight
            - manufacturer: Manufacturer name
            - part_name: Part name
            - serial_id: Serial ID
            - equipment_type: Equipment type
            - final_emission: Total emissions
            - old_total_emissions: Emissions for old equipment
            - new_total_emissions: Emissions for new equipment
            - created_emission: Manufacturing emissions
            - logistics_info: Local logistics information
            - G_logistics_info: Global logistics information (if provided)
            - map_html: HTML representation of the route map
            
    Status Codes:
        200: Success
        404: Part not found
    """
    data = request.get_json()

    manufacturer = data['manufacturer']
    part_name = data['part_name']
    serial_id = data['serial_id']
    equipment_type = data['equipment_type']

    L_pickup = data['pickup']
    L_delivery = data['delivery']
    G_pickup = data.get('G_pickup') # Optional
    G_delivery = data.get('G_delivery') # Optional

    conn = get_db_connection()
    part = conn.execute('SELECT * FROM inventory_parts WHERE manufacturer=? AND part_name=? AND serial_id=?',
                        (manufacturer, part_name, serial_id)).fetchone()
    conn.close()

    if part is None:
        return jsonify({"error": "Part not found"}), 404

    # Calculate manufacturing emissions
    manufacturing_emission = part['manufacturing_emission']
    weight = part['weight']
    used_hours = part['used_hours']
    lifetime_emissions = 16000

    created_emissions = (manufacturing_emission * weight) + (60000 * 3.27) - (5000 * 3.27)

    # Calculate usage emissions
    emission_rate_per_hour = 0.05
    emissions_already_used = used_hours * emission_rate_per_hour
    old_total_emissions = created_emissions - (lifetime_emissions - emissions_already_used)
    new_total_emissions = created_emissions

    if equipment_type == 'Old':
        emission_rate_per_hour = 0.05
        emissions_already_used = used_hours * emission_rate_per_hour
        total_emissions = created_emissions - (lifetime_emissions - emissions_already_used)
    else:
        total_emissions = created_emissions

    component_chart_data = {
    "labels": ["Steel", "Aluminum", "Rubber"],
    "values": [
        part["steel_emissions"],
        part["aluminum_emissions"],
        part["rubber_emissions"]
    ],
    "colors": ["#4caf50", "#2196f3", "#ff9800"]
}


    ##local $$ global declarations##

    logistics_info = distribution_centre(L_pickup, L_delivery, mode="local")
    local_emission = calc_emission(weight, logistics_info["distance"])

    global_emission = 0
    G_logistics_info = None
    if G_pickup and G_delivery:
        G_logistics_info = distribution_centre(G_pickup, G_delivery, mode="global")
        global_emission = calc_emission(weight, G_logistics_info["distance"])

    # Calculate total emissions
    total_emissions = total_emissions + local_emission + global_emission
    old_total_emissions = old_total_emissions + local_emission + global_emission
    new_total_emissions = new_total_emissions + local_emission + global_emission

    # Generate map
    map_object = folium.Map([logistics_info["Olat"], logistics_info["Olon"]], zoom_start=5)
    kw = {"opacity": 1.0, "weight": 6}

    locations = [
        (logistics_info["Olat"], logistics_info["Olon"], "Local Pickup"),
        (logistics_info["Dlat"], logistics_info["Dlon"], "Local Delivery")
    ]

    if G_logistics_info:
        locations.extend([
            (G_logistics_info["Olat"], G_logistics_info["Olon"], "Global Pickup"),
            (G_logistics_info["Dlat"], G_logistics_info["Dlon"], "Global Delivery")
        ])

    for lat, lon, label in locations:
        folium.Marker(
            location=[lat, lon],
            popup=label,
            icon=folium.Icon(color="blue" if "Pickup" in label else "green")
        ).add_to(map_object)

    folium.PolyLine(
        locations=[(lat, lon) for lat, lon, _ in locations],
        tooltip="Route",
        color="red",
        line_cap="round",
        **kw,
    ).add_to(map_object)

    return jsonify({
        "weight": weight,
        "manufacturer": manufacturer,
        "part_name": part_name,
        "serial_id": serial_id,
        "equipment_type": equipment_type,
        'final_emission': total_emissions,
        'old_total_emissions': old_total_emissions,
        'new_total_emissions': new_total_emissions,
        'created_emission': created_emissions,
        'logistics_info': logistics_info,
        'G_logistics_info': G_logistics_info,
        'map_html': map_object._repr_html_(),
        'chart_data': get_chart_data(global_emission, local_emission),
        'component_chart': component_chart_data
    })


if __name__ == '__main__':
    app.run(debug=True)
