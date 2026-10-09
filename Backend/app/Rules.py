
def compare_rule(user_value, rule):
    operator = rule["operator"]
    expected_value = rule.get("value")

    if operator == "equals":
        return user_value == expected_value

    if operator == "greater_than_or_equal":
        return user_value >= expected_value

    if operator == "less_than_or_equal":
        return user_value <= expected_value

    if operator == "greater_than":
        return user_value > expected_value

    if operator == "less_than":
        return user_value < expected_value

    if operator == "between":
        return rule["min_value"] <= user_value <= rule["max_value"]

    if operator == "allowed":
        return user_value in expected_value

    # Conditional rules need additional logic.
    return None


def check_scheme_eligibility(user_profile, scheme):
    passed_rules = []
    failed_rules = []
    missing_rules = []
    review_rules = []

    for rule in scheme.get("eligibility_rules", []):
        field = rule["field"]
        operator = rule["operator"]

        # Handle rules that are not yet implemented.
        if operator in ("conditional", "conditional_income_limit"):
            review_rules.append({
                "field": field,
                "reason": rule["reason"]
            })
            continue

        # Missing information is NOT the same as ineligibility.
        if field not in user_profile or user_profile[field] is None:
            missing_rules.append({
                "field": field,
                "reason": f"Please provide: {field}"
            })
            continue

        try:
            result = compare_rule(user_profile[field], rule)
        except (TypeError, ValueError, KeyError):
            result = None

        if result is True:
            passed_rules.append({
                "field": field,
                "reason": rule["reason"]
            })
        elif result is False:
            failed_rules.append({
                "field": field,
                "reason": rule["reason"]
            })
        else:
            review_rules.append({
                "field": field,
                "reason": f"Unable to evaluate: {rule['reason']}"
            })

    if failed_rules:
        status = "not_eligible"
    elif missing_rules or review_rules:
        status = "needs_more_information"
    else:
        status = "eligible"

    return {
        "eligible": status == "eligible",
        "status": status,
        "passed_rules": passed_rules,
        "failed_rules": failed_rules,
        "missing_rules": missing_rules,
        "review_rules": review_rules
    }
