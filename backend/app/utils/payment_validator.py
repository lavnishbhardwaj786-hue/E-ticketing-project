from stdnum import luhn
from stdnum.exceptions import InvalidChecksum, InvalidLength, InvalidFormat
import re
from datetime import datetime


class CardValidationError(Exception):
    """Custom exception for card validation errors"""
    pass


def detect_card_brand(card_number: str) -> str:
    """
    Detect card brand from card number using BIN ranges

    Returns: "Visa", "Mastercard", "Amex", "Discover", "Unknown"
    """
    # Remove spaces and dashes
    card_number = re.sub(r'[\s-]', '', card_number)

    # Visa: starts with 4
    if card_number.startswith('4'):
        return "Visa"

    # Mastercard: starts with 51-55 or 2221-2720
    if card_number.startswith(('51', '52', '53', '54', '55')):
        return "Mastercard"
    if card_number[:4].isdigit() and 2221 <= int(card_number[:4]) <= 2720:
        return "Mastercard"

    # Amex: starts with 34 or 37
    if card_number.startswith(('34', '37')):
        return "Amex"

    # Discover: starts with 6011, 622126-622925, 644-649, 65
    if card_number.startswith('6011') or card_number.startswith('65'):
        return "Discover"
    if card_number[:6].isdigit() and 622126 <= int(card_number[:6]) <= 622925:
        return "Discover"
    if card_number[:3].isdigit() and 644 <= int(card_number[:3]) <= 649:
        return "Discover"

    return "Unknown"


def validate_card_number(card_number: str) -> tuple[bool, str, str]:
    """
    Validate credit/debit card number using Luhn algorithm

    Returns:
        (is_valid, card_brand, last_4_digits)

    Raises:
        CardValidationError: If card number is invalid
    """
    # Remove spaces and dashes
    card_number = re.sub(r'[\s-]', '', card_number)

    # Check if contains only digits
    if not card_number.isdigit():
        raise CardValidationError("Card number must contain only digits")

    # Check length (13-19 digits for most cards)
    if len(card_number) < 13 or len(card_number) > 19:
        raise CardValidationError("Card number must be 13-19 digits")

    # Detect brand
    brand = detect_card_brand(card_number)

    # Validate using Luhn algorithm
    try:
        luhn.validate(card_number)
    except (InvalidChecksum, InvalidLength, InvalidFormat) as e:
        raise CardValidationError(f"Invalid card number: {str(e)}")

    # Extract last 4 digits
    last_4 = card_number[-4:]

    return True, brand, last_4


def validate_expiry(expiry_month: str, expiry_year: str) -> bool:
    """
    Validate card expiry date

    Args:
        expiry_month: "01" to "12"
        expiry_year: "24" (2024) or "2024"

    Returns:
        True if valid and not expired

    Raises:
        CardValidationError: If expiry is invalid or expired
    """
    try:
        month = int(expiry_month)
        year = int(expiry_year)

        # Handle 2-digit year (convert "24" to "2024")
        if year < 100:
            year += 2000

        # Validate month range
        if month < 1 or month > 12:
            raise CardValidationError("Invalid expiry month (must be 01-12)")

        # Check if expired
        now = datetime.now()
        current_year = now.year
        current_month = now.month

        if year < current_year or (year == current_year and month < current_month):
            raise CardValidationError("Card has expired")

        # Check if expiry is too far in future (>10 years is suspicious)
        if year > current_year + 10:
            raise CardValidationError("Invalid expiry year")

        return True

    except ValueError:
        raise CardValidationError("Invalid expiry format")


def validate_cvv(cvv: str, card_brand: str) -> bool:
    """
    Validate CVV/CVC code

    Args:
        cvv: 3 or 4 digit code
        card_brand: "Visa", "Mastercard", "Amex", etc.

    Returns:
        True if valid

    Raises:
        CardValidationError: If CVV is invalid
    """
    # Remove whitespace
    cvv = cvv.strip()

    # Check if contains only digits
    if not cvv.isdigit():
        raise CardValidationError("CVV must contain only digits")

    # Amex uses 4-digit CVV, others use 3-digit
    if card_brand == "Amex":
        if len(cvv) != 4:
            raise CardValidationError("Amex CVV must be 4 digits")
    else:
        if len(cvv) != 3:
            raise CardValidationError("CVV must be 3 digits")

    return True


def parse_expiry(expiry_str: str) -> tuple[str, str]:
    """
    Parse expiry string in various formats

    Accepts:
        "12/24"
        "12/2024"
        "1224"

    Returns:
        (month, year) as strings
    """
    expiry_str = expiry_str.strip()

    # Format: "MM/YY" or "MM/YYYY"
    if '/' in expiry_str:
        parts = expiry_str.split('/')
        if len(parts) != 2:
            raise CardValidationError("Invalid expiry format")
        return parts[0].zfill(2), parts[1]

    # Format: "MMYY" or "MMYYYY"
    if len(expiry_str) == 4:
        return expiry_str[:2], expiry_str[2:]
    elif len(expiry_str) == 6:
        return expiry_str[:2], expiry_str[2:]

    raise CardValidationError("Invalid expiry format. Use MM/YY or MM/YYYY")