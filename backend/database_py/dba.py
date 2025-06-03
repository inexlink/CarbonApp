import sqlite3
import os

# Define database path
base_dir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(base_dir, 'database', 'carbon.db')

# Ensure the directory exists
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Connect to SQLite DB
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create table
cursor.execute('''
CREATE TABLE IF NOT EXISTS inventory_parts (
    manufacturer TEXT,
    part_name TEXT,
    serial_id TEXT,
    weight REAL,
    drive_type TEXT,
    used_hours REAL,
    fuel_type TEXT,
    steel REAL,
    aluminum REAL,
    rubber REAL,
    other_material REAL,
    steel_emissions REAL,
    aluminum_emissions REAL,
    rubber_emissions REAL,
    manufacturing_emission REAL
)
''')

# Seed data
data = [('Caterpillar','Mining Haul Truck','797F',400,'Mechanical',5000,'Diesel',313.6,34,12,40.4,580.16,374,27.6,981.76),
('Caterpillar','Mining Haul Truck','793F',250,'Mechanical',5000,'Diesel',196,21.25,7.5,25.25,362.6,233.75,17.25,613.6),
('Caterpillar','Mining Haul Truck','785C/D',150,'Mechanical',4800,'Diesel',117.6,12.75,4.5,15.15,217.56,140.25,10.35,368.16),
('Caterpillar','Mining Haul Truck','777G',100,'Mechanical',4500,'Diesel',78.4,8.5,3,10.1,145.04,93.5,6.9,245.44),
('Komatsu','Mining Haul Truck','PC9800',400,'Electric',5000,'Diesel-electric',313.6,34,12,40.4,580.16,374,27.6,981.76),
('Komatsu','Mining Haul Truck','960E-1K',360,'Electric',5000,'Diesel-electric',282.24,30.6,10.8,36.36,522.144,336.6,24.84,883.584),
('Komatsu','Mining Haul Truck','PC8300',240,'Electric',4800,'Diesel-electric',188.16,20.4,7.2,24.24,348.096,224.4,16.56,589.056),
('Komatsu','Mining Haul Truck','HD785-7',100,'Mechanical',4500,'Diesel',78.4,8.5,3,10.1,145.04,93.5,6.9,245.44),
('Liebherr','Mining Haul Truck','T 284',400,'Electric',5000,'Diesel-electric',313.6,34,12,40.4,580.16,374,27.6,981.76),
('Liebherr','Mining Haul Truck','T 264',240,'Electric',4800,'Diesel-electric',188.16,20.4,7.2,24.24,348.096,224.4,16.56,589.056),
('Liebherr','Mining Haul Truck','T 236',100,'Electric',4500,'Diesel-electric',78.4,8.5,3,10.1,145.04,93.5,6.9,245.44),
('Hitachi','Mining Haul Truck','EH5000AC-3',326,'Electric',4800,'Diesel-electric',255.584,27.71,9.78,32.926,472.8304,304.81,22.494,800.1344),
('Hitachi','Mining Haul Truck','EH4000AC-3',221,'Electric',4700,'Diesel-electric',173.264,18.785,6.63,22.321,320.5384,206.635,15.249,542.4224),
('Hitachi','Mining Haul Truck','EH3500AC-3',181,'Electric',4600,'Diesel-electric',141.904,15.385,5.43,18.281,262.5224,169.235,12.489,444.2464),
('Volvo','Mining Haul Truck','A60H',60,'Articulated',4000,'Diesel',47.04,5.1,1.8,6.06,87.024,56.1,4.14,147.264),
('Volvo','Mining Haul Truck','A40G',40,'Articulated',4000,'Diesel',31.36,3.4,1.2,4.04,58.016,37.4,2.76,98.176),
('Caterpillar','Mining Haul Truck','6040',390,'Hydraulic',5000,'Diesel',305.76,33.15,11.7,39.39,565.656,364.65,26.91,957.216),
('Caterpillar','Mining Haul Truck','6060',570,'Hydraulic',5000,'Diesel',446.88,48.45,17.1,57.57,826.728,532.95,39.33,1399.008),
('Caterpillar','Mining Haul Truck','6090 FS',980,'Hydraulic',5000,'Diesel',768.32,83.3,29.4,98.98,1421.392,916.3,67.62,2405.312),
('Komatsu','Mining Haul Truck','PC4000-11',400,'Hydraulic',5000,'Diesel',313.6,34,12,40.4,580.16,374,27.6,981.76),
('Komatsu','Mining Haul Truck','PC5500-6',550,'Hydraulic',5000,'Diesel',431.2,46.75,16.5,55.55,797.72,514.25,37.95,1349.92),
('Komatsu','Mining Haul Truck','PC8000-6',800,'Hydraulic',5000,'Diesel',627.2,68,24,80.8,1160.32,748,55.2,1963.52),
('Liebherr','Mining Haul Truck','R 9400',400,'Hydraulic',5000,'Diesel',313.6,34,12,40.4,580.16,374,27.6,981.76),
('Liebherr','Mining Haul Truck','R 996B',672,'Hydraulic',5000,'Diesel',526.848,57.12,20.16,67.872,974.6688,628.32,46.368,1649.3568),
('Liebherr','Mining Haul Truck','R 9800',800,'Hydraulic',5000,'Diesel',627.2,68,24,80.8,1160.32,748,55.2,1963.52),
('Hitachi','Mining Haul Truck','EX5600-7',533,'Hydraulic',5000,'Diesel',417.872,45.305,15.99,53.833,773.0632,498.355,36.777,1308.1952),
('Hitachi','Mining Haul Truck','EX8000-6',811,'Hydraulic',5000,'Diesel',635.824,68.935,24.33,81.911,1176.2744,758.285,55.959,1990.5184),
('Volvo','Mining Haul Truck','EC950F',90,'Hydraulic',4000,'Diesel',70.56,7.65,2.7,9.09,130.536,84.15,6.21,220.896)




    # (
    #     'Caterpillar', 'Mining Haul Truck', '797F', 400, 'Mechanical', 5000, 'Diesel', 313.6, 34, 12, 40.4, 580.16, 374, 27.6, 981.76
    # ),
    # (
    #     'Komatsu', 'Excavator Z', 'KZ23', 250, 'Hydraulic', 3000, 'Diesel',210, 30, 8, 22, 390, 330, 18, 738
    # ),
    # ('Volvo', 'Drill Machine X', 'VX99', 180, 'Electric', 1000, 'Electric', 180, 15, 5, 10, 290, 165, 11.5, 466.5)
]

# Insert data
cursor.executemany('''
INSERT INTO inventory_parts (
    manufacturer, part_name, serial_id, weight, drive_type, used_hours, fuel_type,
    steel, aluminum, rubber, other_material,
    steel_emissions, aluminum_emissions, rubber_emissions, manufacturing_emission
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', data)

# Finalize
conn.commit()
conn.close()

print(f"✅ Seeded database at: {db_path}")






# # import sqlite3
# # import os

# # # Ensure directory exists
# # os.makedirs('database', exist_ok=True)

# # conn = sqlite3.connect('database/carbon.db')
# # c = conn.cursor()

# # c.execute('''
# #     CREATE TABLE IF NOT EXISTS inventory_parts (
# #         id INTEGER PRIMARY KEY AUTOINCREMENT,
# #         manufacturer TEXT NOT NULL,
# #         part_name TEXT NOT NULL,
# #         serial_id TEXT NOT NULL,
# #         manufacturing_emission REAL NOT NULL,
# #         weight REAL NOT NULL,
# #         used_hours REAL NOT NULL,
# #         lifetime_emissions REAL NOT NULL
# #     )
# # ''')

# # # Dummy 10 records
# # parts = [
# #     ('Caterpillar', 'Hydraulic Pump', 'H123', 1200, 1500, 5000, 30000),
# #     ('Komatsu', 'Excavator Arm', 'E456', 1000, 2000, 4000, 35000),
# #     ('Hitachi', 'Bucket Teeth', 'B789', 800, 300, 3000, 25000),
# #     ('Volvo', 'Wheel Loader', 'W321', 1500, 4000, 2000, 40000),
# #     ('Liebherr', 'Crane Boom', 'C654', 1800, 5000, 6000, 45000),
# #     ('Doosan', 'Track Motor', 'T987', 950, 1200, 3500, 28000),
# #     ('JCB', 'Backhoe Loader', 'B321', 1100, 2500, 4200, 33000),
# #     ('Terex', 'Dump Truck', 'D432', 1700, 6000, 5100, 47000),
# #     ('Hyundai', 'Breaker', 'BR567', 900, 800, 3700, 26000),
# #     ('Atlas Copco', 'Drill Rig', 'DR890', 1400, 4500, 2900, 39000)
# # ]

# # c.executemany('''
# #     INSERT INTO inventory_parts (manufacturer, part_name, serial_id, manufacturing_emission, weight, used_hours, lifetime_emissions)
# #     VALUES (?, ?, ?, ?, ?, ?, ?)
# # ''', parts)

# # conn.commit()
# # conn.close()

# # print('Database created and seeded successfully.')

# ##db 2 
# import sqlite3, os

# base_dir = os.path.abspath(os.path.dirname(__file__))
# db_path = os.path.join(base_dir, 'database', 'carbon.db')

# os.makedirs(os.path.dirname(db_path), exist_ok=True)

# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()

# cursor.execute('''
# CREATE TABLE IF NOT EXISTS inventory_parts (
#     manufacturer TEXT,
#     part_name TEXT,
#     serial_id TEXT,
#     manufacturing_emission REAL,
#     weight REAL,
#     used_hours REAL,
#     lifetime_emissions REAL
# )
# ''')

# cursor.execute('''
# INSERT INTO inventory_parts VALUES (
#     'Caterpillar', 'EnginePartX', '123ABC', 10.5, 2000, 5000, 12000
# )
# ''')

# conn.commit()
# conn.close()

# print(" Created carbon.db at", db_path)
