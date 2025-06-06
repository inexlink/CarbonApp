from flask import Flask, render_template, request
import sqlite3
import pandas as pd
import requests
import folium
import matplotlib.pyplot as plt
import io
import base64
from math import radians, sin, cos, sqrt, atan2
from geopy.geocoders import Nominatim

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database/carbon.db')
    conn.row_factory = sqlite3.Row
    return conn

def load_logistics_factors():
    df = pd.read_csv('uploads/logistics_factors.csv')
    return dict(zip(df['type'], df['emission_factor']))

def geography(name):
    geolocator = Nominatim(user_agent="user1")
    location = geolocator.geocode(name)
    return (location.latitude, location.longitude)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def distribution_centre(pickup, delivery):
    origin = geography(pickup)
    destination = geography(delivery)

    origin_str = f"{origin[1]},{origin[0]}"
    destination_str = f"{destination[1]},{destination[0]}"

    url = f"http://router.project-osrm.org/route/v1/driving/{origin_str};{destination_str}?overview=false"
    response = requests.get(url)
    data = response.json()

    result = {
        "Olat": origin[0],
        "Olon": origin[1],
        "Dlat": destination[0],
        "Dlon": destination[1],
        "distance": None,
        "duration_inland": None,
        "duration_flight": None,
        "duration_ship": None
    }

    if 'routes' in data and len(data['routes']) > 0:
        route = data['routes'][0]
        result["distance"] = route['distance'] / 1000
        result["duration_inland"] = route['duration'] / 3600
    else:
        result["distance"] = haversine(origin[0], origin[1], destination[0], destination[1])
        result["duration_flight"] = result["distance"] / 830
        result["duration_ship"] = result["distance"] / 35

    return result

def calc_emission(weight, distance, fuel_factor=3.27):
    Ef = weight * fuel_factor * distance
    return Ef

def generate_pie_chart(global_emission, local_emission):
    labels = ['Global Emission', 'Local Emission']
    sizes = [global_emission, local_emission]
    colors = ['red', 'green']

    fig, ax = plt.subplots()
    ax.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90, colors=colors)
    ax.axis('equal')
    plt.title('Global vs Local Emission Share')

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    encoded_img = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)

    return encoded_img

@app.route('/', methods=['GET', 'POST'])
def form():
    conn = get_db_connection()

    if request.method == 'POST':
        manufacturer = request.form['manufacturer']
        part_name = request.form['part_name']
        serial_id = request.form['serial_id']
        equipment_type = request.form['equipment_type']
        logistics_type = request.form['logistics_type']
        pickup = request.form['pickup']
        delivery = request.form['delivery']

        part = conn.execute('SELECT * FROM inventory_parts WHERE manufacturer=? AND part_name=? AND serial_id=?',
                            (manufacturer, part_name, serial_id)).fetchone()
        conn.close()

        logistics_factors = load_logistics_factors()
        logistics_factor = logistics_factors.get(logistics_type, 1)

        manufacturing_emission = part['manufacturing_emission']
        weight = part['weight']
        used_hours = part['used_hours']
        lifetime_emissions = part['lifetime_emissions']

        created_emissions = (manufacturing_emission * weight) + (60000 * 3.27) - (5000 * 3.27)

        if equipment_type == 'Old':
            emission_rate_per_hour = 0.05
            emissions_already_used = used_hours * emission_rate_per_hour
            total_emissions = created_emissions - (lifetime_emissions - emissions_already_used)
        else:
            total_emissions = created_emissions

        logistics_info = distribution_centre(pickup, delivery)
        distance = logistics_info["distance"]

        if logistics_type == "Global":
            global_emission = calc_emission(weight, distance)
            local_emission = 0
        else:
            global_emission = 0
            local_emission = calc_emission(weight, distance)

        pie_chart = generate_pie_chart(global_emission, local_emission)

        map_object = folium.Map([logistics_info["Olat"], logistics_info["Olon"]], zoom_start=5)
        kw = {"opacity": 1.0, "weight": 6}

        folium.Marker(
            location=[logistics_info["Olat"], logistics_info["Olon"]],
            popup="Pickup",
            icon=folium.Icon(color="blue")
        ).add_to(map_object)

        folium.Marker(
            location=[logistics_info["Dlat"], logistics_info["Dlon"]],
            popup="Delivery",
            icon=folium.Icon(color="green")
        ).add_to(map_object)

        folium.PolyLine(
            locations=[(logistics_info["Olat"], logistics_info["Olon"]), (logistics_info["Dlat"], logistics_info["Dlon"])],
            tooltip="Route",
            color="red" if logistics_type == "Local" else "green",
            line_cap="round",
            **kw,
        ).add_to(map_object)

        map_html = map_object._repr_html_()

        return render_template('result.html', final_emission=total_emissions,
                               logistics_info=logistics_info, map_html=map_html, pie_chart=pie_chart)

    manufacturers = conn.execute('SELECT DISTINCT manufacturer FROM inventory_parts').fetchall()
    logistics_types = load_logistics_factors().keys()
    conn.close()
    return render_template('form.html', manufacturers=manufacturers, logistics_types=logistics_types)

if __name__ == '__main__':
    app.run(debug=True)
