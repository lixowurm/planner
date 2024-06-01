import logging
from flask import Flask, request, jsonify, send_from_directory, Blueprint
import requests, os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv('stuff.env')
print(os.getenv('distanceApiKey'))


# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set the logging level to DEBUG

address = Blueprint('address', __name__)

class Address:
    def __init__(self): 
        self.legal = ["hu"]
        self.apiKeyDistance = os.getenv('DISTANCE_API_KEY')

    def urlEncode(self, value):
        from urllib.parse import quote
        return quote(value)

    def getDistance(self, origin, destination):
        from datetime import datetime, timedelta
        import requests
        
        now = datetime.now()
        tomorrow = now + timedelta(days=1)
        departure_time = int(tomorrow.replace(hour=2, minute=0, second=0).timestamp())

        url = (f"https://api.distancematrix.ai/maps/api/distancematrix/json?"
               f"origins={origin[0]},{origin[1]}&destinations={destination[0]},{destination[1]}"
               f"&key={self.apiKeyDistance}&departure_time={departure_time}")
        

        try:
            response = requests.get(url)
            data = response.json()
            elements = data['rows'][0]['elements']
            if elements[0]['status'] == "OK":
                distance_in_meters = elements[0]['distance']['value']
                return distance_in_meters / 1000.0  # Convert meters to kilometers
            else:
                return 0.0
        except Exception as e:
            print("Failed to fetch distance:", e)
            return 0.0

    def checkAddress(self, destination):
        from urllib.parse import quote
        import requests
        
        encoded_destination = self.urlEncode(destination)
        url = (f"https://nominatim.openstreetmap.org/search?"
               f"addressdetails=1&q={encoded_destination}+Hungary&format=jsonv2&limit=1")
        print(url)

        headers = {
            'Referer': 'PlannerSoft23@gmail.com',
            'User-Agent': 'PlannerSoftv0.01'
        }

        try:
            response = requests.get(url, headers=headers)
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                location = data[0]
                latitude = float(location['lat'])
                longitude = float(location['lon'])
                address = location['address']
                road = address.get('road', "")
                city = address.get('city', "")
                suburb = address.get('suburb', "")
                town = address.get('town', "")
                postcode = address.get('postcode', "")
                country = address.get('country', "")
                country_code = address.get('country_code', "")
                display_name = f"{road} {self.streetNumber(destination)}, {city} {postcode} {country}"
                if self.checkLegal(country_code):
                    return {"display_name": display_name, "coordinates": [latitude, longitude], "suburb": suburb, "town": town, "city": city, "postcode": postcode, "country": country}
                else:
                    return {"display_name": "ill", "coordinates": [0.0, 0.0]}
            else:
                return {"display_name": "null", "coordinates": [0.0, 0.0]}
        except Exception as e:
            print("HTTP request failed:", e)
            return {"display_name": "null", "coordinates": [0.0, 0.0]}

    def checkLegal(self, country_code):
        return country_code in self.legal

    def streetNumber(self, destination):
        import re
        pattern = re.compile(r"(\d+)(\s+[A-Za-z]+)?")
        match = pattern.search(destination)
        if match:
            return match.group(1)
        else:
            return ""

address_instance = Address()

@address.route('/getDistance', methods=['POST'])
def get_distance():
    data = request.json
    origin = data.get('origin')
    destination = data.get('destination')
    if not origin or not destination:
        return jsonify({"error": "Invalid input"}), 400
    distance = address_instance.getDistance(origin, destination)
    return jsonify({"distance": distance})

@address.route('/checkAddress', methods=['POST'])
def check_address():
    data = request.json
    destination = data.get('destination')
    if not destination:
        return jsonify({"error": "Invalid input"}), 400
    result = address_instance.checkAddress(destination)
    return jsonify(result)

