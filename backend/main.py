# Now use them
def print_trip_summary(
    destination = input("Destination: "), 
    country = input("Country: "),
    days = int(input("Days: ")), 
    budget = float(input("Budget: ")),
    currency = input("Currency: "),
    travel_style = input("Travel Style: "),
    travel_month = input("Travel Month: "),
    hotel_cost = float(input("Hotel Cost: ")),
    food_cost = float(input("Food Cost: ")),
    transportation_cost = float(input("Transportation Cost: ")),
    miscellaneous_cost = float(input("Misc. Cost: "))
):
    total_estimated_cost = (
        hotel_cost
        + food_cost
        + transportation_cost
        + miscellaneous_cost
    )
    
    print("======================")
    print("KelanaAI")
    print("======================")
    print(f"Destination     : {destination.capitalize()}")
    print(f"Country         : {country.capitalize()}")
    print(f"Days            : {days}")
    print(f"Budget          : {budget} {currency.upper()}")
    print(f"Currency        : {currency.upper()}")
    print(f"Travel Month    : {currency.upper()}")
    print(f"Style           : {travel_style.capitalize()}")
    print(f"Hotel Cost      : {hotel_cost} {currency.upper()}")
    print(f"Food Cost       : {food_cost} {currency.upper()}")
    print(f"Transport Cost  : {transportation_cost} {currency.upper()}")
    print(f"Misc Cost       : {miscellaneous_cost} {currency.upper()}")
    print(f"Total           : {total_estimated_cost} {currency.upper()}")

    if total_estimated_cost > budget:
        print("\033[93m ⚠ Budget exceeded.\033[0m")

    print()

# call it with any trip
print_trip_summary()
