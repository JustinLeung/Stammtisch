"""20 synthetic users clustered around the four seeded neighborhoods, with
deliberately overlapping interests/availability so the matcher can find
clusters, plus a few edge cases (unverified, tight constraints, tiny radius)."""


def U(name, interests, lat, lng, radius, windows, budget="mid",
      constraints=None, verified=True):
    return {
        "display_name": name,
        "interests": interests,
        "home_lat": lat,
        "home_lng": lng,
        "travel_radius_km": radius,
        "availability_windows": windows,
        "budget_band": budget,
        "constraints": constraints or {"dietary": [], "accessibility": [], "alcohol_ok": True, "setting": "either"},
        "verification_status": "verified" if verified else "unverified",
    }


def W(dow, start, end):
    return {"dow": dow, "start": start, "end": end}


# dow: Mon=0 .. Sun=6
THU_EVE = W(3, "18:00", "22:00")
SAT_AFT = W(5, "13:00", "18:00")
SAT_EVE = W(5, "18:00", "23:00")
SUN_MORN = W(6, "09:00", "13:00")
WED_EVE = W(2, "18:00", "22:00")

USERS = [
    # --- bouldering cluster, Haidhausen/Glockenbach, Thu evenings ---
    U("Lena", ["bouldering", "hiking", "coffee"], 48.130, 11.600, 5, [THU_EVE, SUN_MORN]),
    U("Jonas", ["bouldering", "techno", "cycling"], 48.128, 11.592, 6, [THU_EVE, SAT_EVE]),
    U("Amelie", ["bouldering", "yoga", "photography"], 48.126, 11.575, 4, [THU_EVE, SAT_AFT]),
    U("Felix", ["bouldering", "board games", "beer"], 48.133, 11.605, 8, [THU_EVE, WED_EVE]),
    U("Sofia", ["climbing", "bouldering", "running"], 48.124, 11.580, 5, [THU_EVE, SUN_MORN],
      constraints={"dietary": ["vegetarian"], "accessibility": [], "alcohol_ok": True, "setting": "either"}),

    # --- board games cluster, Maxvorstadt, Wed evenings ---
    U("Maxi", ["board games", "chess", "film"], 48.151, 11.568, 4, [WED_EVE, SAT_AFT], budget="low"),
    U("Greta", ["board games", "books", "museums"], 48.149, 11.572, 3, [WED_EVE, SUN_MORN], budget="low",
      constraints={"dietary": [], "accessibility": [], "alcohol_ok": False, "setting": "indoor"}),
    U("Niko", ["board games", "startup", "poker"], 48.153, 11.560, 6, [WED_EVE, THU_EVE]),
    U("Paula", ["board games", "karaoke", "cooking"], 48.146, 11.564, 5, [WED_EVE, SAT_EVE]),

    # --- jazz / culture cluster, Haidhausen, Sat evenings ---
    U("Emir", ["jazz", "vinyl", "wine"], 48.131, 11.598, 5, [SAT_EVE, THU_EVE]),
    U("Hannah", ["jazz", "museums", "photography"], 48.134, 11.595, 4, [SAT_EVE, SUN_MORN]),
    U("Luis", ["live music", "jazz", "cooking"], 48.127, 11.590, 7, [SAT_EVE, WED_EVE]),
    U("Theresa", ["jazz", "dance", "theatre"], 48.130, 11.588, 3, [SAT_EVE],
      constraints={"dietary": [], "accessibility": ["wheelchair"], "alcohol_ok": True, "setting": "indoor"}),

    # --- outdoors cluster, Schwabing, Sun mornings ---
    U("Yusuf", ["running", "hiking", "swimming"], 48.159, 11.586, 6, [SUN_MORN, SAT_AFT], budget="low"),
    U("Clara", ["hiking", "picnic", "photography"], 48.162, 11.580, 8, [SUN_MORN, SAT_AFT], budget="low"),
    U("Béla", ["running", "cycling", "sauna"], 48.156, 11.590, 5, [SUN_MORN, THU_EVE]),
    U("Franzi", ["hiking", "yoga", "vegan food"], 48.160, 11.575, 4, [SUN_MORN],
      constraints={"dietary": ["vegan"], "accessibility": [], "alcohol_ok": False, "setting": "outdoor"}),

    # --- edge cases ---
    U("Oskar", ["chess", "philosophy"], 48.150, 11.570, 1, [SAT_AFT], budget="low"),   # tiny radius
    U("Mia", ["techno", "karaoke"], 48.129, 11.573, 10, [SAT_EVE], verified=False),    # unverified → can't join public
    U("Quirin", ["bouldering", "board games", "jazz"], 48.140, 11.585, 9, [THU_EVE, WED_EVE, SAT_EVE], budget="high"),  # bridges clusters
]
