import sqlite3
import os

# Ensure directory exists
os.makedirs('database', exist_ok=True)

conn = sqlite3.connect('database/carbon.db')
c = conn.cursor()

c.execute('''
    CREATE TABLE IF NOT EXISTS inventory_parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        manufacturer TEXT NOT NULL,
        part_name TEXT NOT NULL,
        serial_id TEXT NOT NULL,
        manufacturing_emission REAL NOT NULL,
        weight REAL NOT NULL,
        used_hours REAL NOT NULL,
        lifetime_emissions REAL NOT NULL
    )
''')

# Dummy 10 records
parts = [
    ('Caterpillar', 'Hydraulic Pump', 'H123', 1200, 1500, 5000, 30000),
    ('Komatsu', 'Excavator Arm', 'E456', 1000, 2000, 4000, 35000),
    ('Hitachi', 'Bucket Teeth', 'B789', 800, 300, 3000, 25000),
    ('Volvo', 'Wheel Loader', 'W321', 1500, 4000, 2000, 40000),
    ('Liebherr', 'Crane Boom', 'C654', 1800, 5000, 6000, 45000),
    ('Doosan', 'Track Motor', 'T987', 950, 1200, 3500, 28000),
    ('JCB', 'Backhoe Loader', 'B321', 1100, 2500, 4200, 33000),
    ('Terex', 'Dump Truck', 'D432', 1700, 6000, 5100, 47000),
    ('Hyundai', 'Breaker', 'BR567', 900, 800, 3700, 26000),
    ('Atlas Copco', 'Drill Rig', 'DR890', 1400, 4500, 2900, 39000)
]

c.executemany('''
    INSERT INTO inventory_parts (manufacturer, part_name, serial_id, manufacturing_emission, weight, used_hours, lifetime_emissions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', parts)

conn.commit()
conn.close()

print('Database created and seeded successfully.')
