import os
import json
import boto3

from dotenv import load_dotenv

load_dotenv()


def get_bedrock_client():
    """
    Create AWS Bedrock Runtime client.
    """

    bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    region = os.getenv("AWS_REGION", "ap-southeast-2")

    if not bearer_token:
        raise ValueError(
            "AWS_BEARER_TOKEN_BEDROCK is not configured"
        )

    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=region,
        aws_access_key_id="Bearer",
        aws_secret_access_key=bearer_token,
    )

    return client


def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    month: str,
    travel_style: str,
    travel_season: str,
):
    """
    Generate structured travel itinerary using Amazon Bedrock.
    """

    client = get_bedrock_client()

    model_id = os.getenv(
        "MODEL_ID",
        "amazon.nova-lite-v1:0"
    )

    prompt = (
        # f"You are an experienced travel planner.\n"
        # f"Plan a detailed {days}-day itinerary for {destination}.\n"
        # f"Budget: USD {budget}.\n"
        # f"Travel Style: {travel_style}.\n\n"

        # f"""
        # The destination itself must remain the primary focus of the itinerary.
        # Do not replace the destination with nearby tourist attractions.
        # """

        # f"""
        # IMPORTANT DESTINATION RULES:

        # 1. The user's destination is the PRIMARY destination.
        # 2. All major activities must be directly related to the destination.
        # 3. Do NOT replace the destination with nearby popular attractions.
        # 4. Do NOT assume that a destination refers to its entire surrounding region.
        # 5. If the destination is a mountain, prioritize hiking, trekking, camping,
        # summit activities, trail preparation, and descent.
        # 6. Nearby locations may only be included when they are necessary for
        # transportation, accommodation, permits, food, or access to the destination.
        # 7. Never include unrelated tourist attractions simply because they are popular
        # in the same province or region.
        # """

        # f"For each day, create a structured daily plan with the following sections:\n\n"

        # f"## Morning Activities\n"
        # f"- Provide 2-3 specific morning activities.\n"
        # f"- Include the name of the place and a short description.\n\n"

        # f"## Afternoon Activities\n"
        # f"- Recommend cultural sites, historical landmarks, museums, "
        # f"traditional markets, and authentic local experiences.\n"
        # f"- Prioritize places that are close to each other to make the itinerary realistic.\n\n"

        # f"## Evening Activities\n"
        # f"- Recommend suitable dinner spots and local food to try.\n"
        # f"- Recommend nightlife or evening entertainment.\n\n"

        # f"## Transportation\n"
        # f"- Recommend suitable transportation options for the itinerary.\n"
        # f"- Consider the traveler's budget and travel style.\n\n"

        # f"## Estimated Costs\n"
        # f"- Estimate transportation, food, entrance fees, and other relevant costs.\n"
        # f"- The Total Estimated Cost MUST NOT exceed USD {budget:.0f}.\n\n"

        # f"""
        # Before returning the itinerary, verify:

        # - Is every major activity related to the requested destination?
        # - Does the itinerary actually allow the traveler to experience the destination?
        # - Have I accidentally substituted the destination with another attraction?
        # - Are the locations geographically reasonable?
        # - Does the itinerary match the requested travel style?
        # - Does the itinerary fit the requested number of days?
        # - Does the estimated cost remain within the user's budget?

        # If any answer is NO, revise the itinerary before returning it.
        # """

        f"""
        You are an expert travel planner specializing in destination-specific itineraries.

        TRIP INFORMATION
        Destination: {destination}
        Duration: {days} days
        Budget: USD {budget}
        Month: {month}
        Travel Style: {travel_style}

        DESTINATION FOCUS

        The destination provided by the traveler is the PRIMARY destination.

        The itinerary MUST focus on experiencing and reaching the requested
        destination.

        Do NOT substitute the destination with other popular attractions in the
        same province, island, or region.

        If the destination is a mountain, the itinerary should primarily focus on:
        - hiking/trekking
        - trail progression
        - campsites
        - summit activities
        - rest and recovery
        - permits and registration
        - transportation to/from the trailhead
        - food and water
        - appropriate safety considerations

        Nearby attractions should only be included when they are directly necessary
        for accessing or completing the trip.

        DESTINATION INTEGRITY CHECK

        Before generating the final answer, verify that:
        1. The requested destination remains the central focus.
        2. Major activities are directly related to the destination.
        3. The itinerary does not randomly include unrelated tourist attractions.
        4. Locations are geographically reasonable.
        5. Duration and budget are realistic.
        6. Activities match the traveler's travel style.

        If any condition fails, revise the itinerary.
               
        """

        f"Give the answer with markdown format."
    )


    # Amazon Nova uses the Converse API
    client = get_bedrock_client()

    response = client.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
        inferenceConfig={
            "maxTokens": 2048,
            "temperature": 0.2,
            "topP": 0.9,
        },
    )

    # Extract the assistant's reply from the response
    output_message = response["output"]["message"]
    recommendation = "".join(
        block["text"]
        for block in output_message["content"]
        if "text" in block
    )

    return recommendation

