def calculate_daily_budget(budget, days):
    return budget / days

def get_total_estimated_cost(
    hotel_cost,
    food_cost,
    transportation_cost,
    miscellaneous_cost,
):
    return (
        hotel_cost
        + food_cost
        + transportation_cost
        +miscellaneous_cost
    )

    
def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standart"
    else:
        return "Luxury"

        
def get_transportation_recommendation(category):
    if category.lower() == "backpacker":
        return "Bus"
    elif category.lower() == "standart":
        return "Train"
    else:
        return "Flight"


def get_travel_season(month):
    month = month.lower()
    
    if month == "december":
        return "Peak Season"
    elif month == "June":
        return "Holiday Season"
    else:
        return "Reguler Season"
        

def get_recommended_places(destination):
    recommendations = {
        "japan": [
            "Tokyo Tower", 
            "Shibuya", 
            "Mount Fuji"
        ],
        "indonesia": [
            "Jakarta",
            "Yogyakarta",
            "Bali"
        ],
        "bali": [
            "Ubud", 
            "Kuta Beach", 
            "Tanah Lot"
        ],
    }

    return recommendations.get(
        destination, 
        ["City Center", "Local Market", "Popular Landmark"]
    )
