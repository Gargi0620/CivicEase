
import re


def normalise(value):
    """Convert values to comparable lowercase text."""
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value).strip().lower())


def compare_rule(user_value, rule):
    """Evaluate one structured eligibility rule."""
    operator = rule.get("operator")
    expected = rule.get("value")

    if operator == "equals":
        return normalise(user_value) == normalise(expected)

    if operator == "not_equals":
        return normalise(user_value) != normalise(expected)

    if operator == "contains":
        return normalise(expected) in normalise(user_value)

    if operator == "allowed":
        if not isinstance(expected, list):
            return None
        return normalise(user_value) in [
            normalise(item) for item in expected
        ]

    try:
        actual = float(user_value)
        target = float(expected)

        if operator == "greater_than_or_equal":
            return actual >= target
        if operator == "less_than_or_equal":
            return actual <= target
        if operator == "greater_than":
            return actual > target
        if operator == "less_than":
            return actual < target
        if operator == "between":
            return (
                float(rule["min_value"])
                <= actual
                <= float(rule["max_value"])
            )
    except (TypeError, ValueError, KeyError):
        return None

    return None


def check_scheme_eligibility(user_profile, scheme):
    """
    Evaluate structured rules stored in eligibility_rules.

    Accepted formats:
      [{"field": "state", "operator": "equals",
        "value": "Maharashtra", "reason": "..."}]

    Or:
      {"all": [rule, rule]}
    """
    rules = scheme.get("eligibility_rules") or []

    if isinstance(rules, dict):
        rules = rules.get("all", [])

    if not isinstance(rules, list) or not rules:
        return {
            "status": "needs_review",
            "eligible": None,
            "passed_rules": [],
            "failed_rules": [],
            "missing_rules": [],
            "review_rules": [{
                "field": "eligibility_rules",
                "reason": (
                    "Structured rules are not configured for this scheme yet."
                ),
            }],
        }

    passed_rules = []
    failed_rules = []
    missing_rules = []
    review_rules = []

    for rule in rules:
        field = rule.get("field")
        reason = rule.get("reason") or f"Requirement: {field}"

        if not field:
            review_rules.append({
                "field": "unknown",
                "reason": "This rule has no field configured.",
            })
            continue

        value = user_profile.get(field)

        if value is None or value == "":
            missing_rules.append({
                "field": field,
                "reason": f"More information needed: {reason}",
            })
            continue

        result = compare_rule(value, rule)

        if result is True:
            passed_rules.append({"field": field, "reason": reason})
        elif result is False:
            failed_rules.append({"field": field, "reason": reason})
        else:
            review_rules.append({
                "field": field,
                "reason": f"Could not evaluate automatically: {reason}",
            })

    if failed_rules:
        status = "not_eligible"
    elif missing_rules or review_rules:
        status = "needs_more_information"
    else:
        status = "eligible"

    return {
        "status": status,
        "eligible": status == "eligible",
        "passed_rules": passed_rules,
        "failed_rules": failed_rules,
        "missing_rules": missing_rules,
        "review_rules": review_rules,
    }


def profile_matches_scheme(profile, scheme):
    """
    Conservative first-pass relevance matching.

    Returns (is_relevant, reasons). These matches are preliminary
    and must not be presented as confirmed eligibility.
    """
    reasons = []

    stage_aliases = {
        "i have a business idea": ["planning"],
        "planning to start a business": ["planning", "startup"],
        "business recently started": ["startup"],
        "existing business": ["existing"],
    }

    type_aliases = {
        "manufacturing": ["manufacturing"],
        "retail / trading": ["retail", "trading"],
        "service-based business": ["services", "service"],
        "food / food processing": ["food processing", "food"],
        "agriculture / allied activities": [
            "agriculture", "allied", "dairy", "farming"
        ],
        "handicrafts / handloom": ["handicrafts", "handloom", "textiles"],
        "technology / startup": ["tech", "technology", "startup"],
    }

    stage = normalise(profile.get("stage"))
    business_type = normalise(
        profile.get("otherBusiness") or profile.get("businessType")
    )

    scheme_stages = normalise(scheme.get("business_stage"))
    scheme_types = normalise(scheme.get("business_type"))

    # Do not reject a scheme merely because a field is unanswered.
    if stage:
        wanted_stages = stage_aliases.get(stage, [stage])
        if any(item in scheme_stages for item in wanted_stages):
            reasons.append("Business stage appears to match.")
        elif scheme_stages:
            return False, []

    if business_type:
        wanted_types = type_aliases.get(business_type, [business_type])
        if any(item in scheme_types for item in wanted_types):
            reasons.append("Business type appears to match.")
        elif scheme_types:
            return False, []

    category = normalise(profile.get("beneficiaryCategory"))
    target = normalise(scheme.get("target_beneficiaries"))

    category_aliases = {
        "scheduled tribe (st)": ["scheduled tribe", "st"],
        "scheduled caste (sc)": ["scheduled caste", "sc"],
        "other backward class (obc)": ["other backward class", "obc"],
        "minority community": ["minority"],
        "person with disability": ["disability", "disabled"],
    }

    if category and category != "general":
        aliases = category_aliases.get(category, [category])
        if any(alias in target for alias in aliases):
            reasons.append("Beneficiary category appears to match.")

    # Require at least one positive signal. If the profile has no usable
    # answers, return no recommendation rather than all 50 schemes.
    return bool(reasons), reasons
