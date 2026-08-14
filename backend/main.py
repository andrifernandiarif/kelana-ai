from services.trip_service import (
    calculate_daily_budget,
    get_total_estimated_cost,
    get_trip_category,
    get_transportation_recommendation,
    get_travel_season,
    get_recommended_places,
)

# Input Destination
destinations = []

while True:
    destination = input("Destination (type 'done' to finish): ")
    if destination.lower() == "done":
        break
    destinations.append(destination)
    
# Display Multiple Destinations
for i, destination in enumerate(destinations, start=1):
    print(f"Your Destinations # {i}. : {destination.capitalize()}")

# Input Trip Data
days = int(input("Days: "))
budget = float(input("Budget: "))
currency = input("Currency: ")
month = input("Travel Month: ")

hotel_cost = float(input("Hotel Cost: "))
food_cost = float(input("Food Cost: "))
transportation_cost = float(input("Transportation Cost: "))
miscellaneous_cost = float(input("Misc. Cost: "))

def print_destinations(destinations):
    destinations_text = " ".join(
        f"{i}. {destination.capitalize()}"
        for i, destination in enumerate(destinations, start=1)
    )

    return destinations_text

def print_recommended_places(destinations):
    print("Recommended Places")
    print()

    for destination in destinations:
        print(destination)
        places = get_recommended_places(destination)

        for place in places:
            print(f"- {place}")
        
        print()

def print_trip_summary(
    destinations, days, budget, currency, month,
    hotel_cost, food_cost, transportation_cost, miscellaneous_cost,
):
    daily_budget = calculate_daily_budget(budget, days)
    category = get_trip_category(budget)
    transportation = get_transportation_recommendation(category)
    season = get_travel_season(month)
    destinations_text = print_destinations(destinations)

    print("======================")
    print("KelanaAI")
    print("======================")
    print()

    # Trip Details Display
    print(f"Your Destinations           : {destinations_text}")
    print(f"Days                        : {days}")
    print(f"Travel Month                : {month.capitalize()}")
    print(f"Season                      : {season}")
    print(f"Budget                      : {budget}")
    print(f'Category                    : "{category}"')
    print(f"Daily Budget                : {daily_budget:.0f} {currency.upper()}/Days")
    print(f"Recommended Transportation  : {transportation}")
    print()

    # Cost Breakdown Display
    print("Cost Breakdown")
    print(f"Hotel Cost      : {hotel_cost} {currency.upper()}")
    print(f"Food Cost       : {food_cost} {currency.upper()}")
    print(f"Transport Cost  : {transportation_cost} {currency.upper()}")
    print(f"Misc Cost       : {miscellaneous_cost} {currency.upper()}")

    print()

    total_estimated_cost = get_total_estimated_cost(
        hotel_cost,
        food_cost,
        transportation_cost,
        miscellaneous_cost,
    )

    if total_estimated_cost > budget:
        print("\033[93m ⚠ Budget exceeded.\033[0m")

    print()

# Trip Summary Display
print_trip_summary(
    destinations, days, budget, currency, month,
    hotel_cost, food_cost, transportation_cost, miscellaneous_cost,
)

# Recommended Places Display
print("Recommended Places")
print()

for destination in destinations:
    places = get_recommended_places(destination)

    print(f"--- {destination.capitalize()} ---")

    for place in places:
        print(f" - {place}")

    print()

