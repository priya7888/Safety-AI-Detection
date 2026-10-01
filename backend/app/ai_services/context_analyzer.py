def get_category_context(report_type: str) -> dict:
    """
    Returns the analytical lens and focus area based on report category.
    Note: The category provides analysis context only and does NOT automatically
    determine risk, severity, or SIF status.
    """
    r_type = (report_type or "").upper().replace("-", "_").replace(" ", "_")

    if r_type == "UNSAFE_ACT":
        return {
            "category": "UNSAFE_ACT",
            "focus": "Human action, worker behavior, task execution, procedure adherence, and direct hazard exposure.",
            "description": "The report was analyzed with focus on human action, activity, hazard exposure, and available safety controls."
        }
    elif r_type == "UNSAFE_CONDITION":
        return {
            "category": "UNSAFE_CONDITION",
            "focus": "Physical workplace condition, equipment integrity, environmental factors, and engineering controls.",
            "description": "The report was analyzed with focus on the hazardous condition, hazard source, potential exposure, and control condition."
        }
    elif r_type == "NEAR_MISS":
        return {
            "category": "NEAR_MISS",
            "focus": "Unplanned safety event, release of energy or sequence of events, personnel exposure, and barrier effectiveness.",
            "description": "The report was analyzed with focus on the event, potential exposure, possible consequences, and available barriers."
        }
    else:
        return {
            "category": "GENERAL_OBSERVATION",
            "focus": "General industrial safety observation, hazards, and controls.",
            "description": "The report was analyzed with focus on available safety information, identified hazards, and control measures."
        }
