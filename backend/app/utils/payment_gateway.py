from abc import ABC, abstractmethod
from typing import Dict, Any
import uuid
from datetime import datetime


class PaymentResult:
    """Standardized payment result across all gateways"""

    def __init__(
            self,
            success: bool,
            transaction_id: str | None = None,
            error_message: str | None = None,
            gateway_response: Dict[str, Any] | None = None
    ):
        self.success = success
        self.transaction_id = transaction_id
        self.error_message = error_message
        self.gateway_response = gateway_response or {}


class PaymentGateway(ABC):
    """Abstract base class for payment gateways"""

    @abstractmethod
    def charge(
            self,
            amount: float,
            currency: str,
            card_number: str,
            card_expiry: str,
            card_cvv: str,
            cardholder_name: str,
            description: str | None = None,
            metadata: Dict[str, Any] | None = None
    ) -> PaymentResult:
        """
        Process a payment charge

        Returns:
            PaymentResult with success status and transaction_id
        """
        pass

    @abstractmethod
    def refund(
            self,
            transaction_id: str,
            amount: float | None = None
    ) -> PaymentResult:
        """
        Refund a payment (full or partial)

        Args:
            transaction_id: Original transaction ID
            amount: Amount to refund (None = full refund)

        Returns:
            PaymentResult with success status
        """
        pass


class MockPaymentGateway(PaymentGateway):
    """
    Mock payment gateway for testing

    Always succeeds unless card number ends with specific digits:
    - Ends with 0000: Declined (insufficient funds)
    - Ends with 1111: Declined (card declined)
    - Ends with 2222: Gateway timeout
    - Otherwise: Success
    """

    def charge(
            self,
            amount: float,
            currency: str,
            card_number: str,
            card_expiry: str,
            card_cvv: str,
            cardholder_name: str,
            description: str | None = None,
            metadata: Dict[str, Any] | None = None
    ) -> PaymentResult:

        # Simulate processing delay
        import time
        time.sleep(0.5)  # 500ms delay to simulate network call

        # Check test card numbers
        last_4 = card_number[-4:]

        if last_4 == "0000":
            return PaymentResult(
                success=False,
                error_message="Insufficient funds",
                gateway_response={"code": "insufficient_funds"}
            )

        if last_4 == "1111":
            return PaymentResult(
                success=False,
                error_message="Card declined by issuer",
                gateway_response={"code": "card_declined"}
            )

        if last_4 == "2222":
            return PaymentResult(
                success=False,
                error_message="Gateway timeout",
                gateway_response={"code": "timeout"}
            )

        # Success case
        transaction_id = f"mock_txn_{uuid.uuid4().hex[:16]}"

        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            gateway_response={
                "amount": amount,
                "currency": currency,
                "timestamp": datetime.utcnow().isoformat(),
                "card_last4": last_4
            }
        )

    def refund(
            self,
            transaction_id: str,
            amount: float | None = None
    ) -> PaymentResult:

        # Mock refund always succeeds
        refund_id = f"mock_refund_{uuid.uuid4().hex[:16]}"

        return PaymentResult(
            success=True,
            transaction_id=refund_id,
            gateway_response={
                "original_transaction": transaction_id,
                "refund_amount": amount,
                "timestamp": datetime.utcnow().isoformat()
            }
        )


# Factory function to get the configured gateway
def get_payment_gateway() -> PaymentGateway:
    """
    Returns the configured payment gateway

    TODO: Add real gateways (Stripe, Razorpay) and configure via .env
    """
    # For now, always return mock gateway
    # Later: Read from config and return appropriate gateway
    return MockPaymentGateway()