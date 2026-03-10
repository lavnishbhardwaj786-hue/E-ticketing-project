import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM_EMAIL,
    SMTP_FROM_NAME
)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    plain_content: str = None
):
    """Send email via SMTP"""
    
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    
    # Plain text fallback
    if plain_content:
        message.attach(MIMEText(plain_content, "plain"))
    
    # HTML content
    message.attach(MIMEText(html_content, "html"))
    
    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email failed: {e}")
        # Don't raise - email failure shouldn't break booking


async def send_booking_confirmation(
    to_email: str,
    booking_reference: str,
    ticket_number: str,
    passenger_name: str,
    flight_number: str,
    route: str,
    departure_time: str,
    seat_number: str,
    total_amount: float,
    currency: str
):
    """Send booking confirmation email"""
    
    subject = f"Booking Confirmed - {booking_reference}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #2563EB; color: white; padding: 20px; text-align: center; }}
            .content {{ background: #f9fafb; padding: 20px; }}
            .ticket-info {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2563EB; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
            .highlight {{ font-size: 24px; font-weight: bold; color: #2563EB; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✈️ Booking Confirmed!</h1>
            </div>
            
            <div class="content">
                <p>Dear {passenger_name},</p>
                <p>Your flight has been successfully booked.</p>
                
                <div class="ticket-info">
                    <p><strong>Booking Reference:</strong> <span class="highlight">{booking_reference}</span></p>
                    <p><strong>Ticket Number:</strong> {ticket_number}</p>
                    <p><strong>Flight:</strong> {flight_number}</p>
                    <p><strong>Route:</strong> {route}</p>
                    <p><strong>Departure:</strong> {departure_time}</p>
                    <p><strong>Seat:</strong> {seat_number}</p>
                    <p><strong>Total Paid:</strong> {currency} {total_amount:.2f}</p>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ul>
                    <li>Web check-in opens 24 hours before departure</li>
                    <li>Arrive at airport 2 hours before departure</li>
                    <li>Bring valid ID matching passenger name</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply.</p>
                <p>&copy; 2026 E-Ticketing System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_content = f"""
    Booking Confirmed - {booking_reference}
    
    Dear {passenger_name},
    
    Your flight has been successfully booked.
    
    Booking Reference: {booking_reference}
    Ticket Number: {ticket_number}
    Flight: {flight_number}
    Route: {route}
    Departure: {departure_time}
    Seat: {seat_number}
    Total Paid: {currency} {total_amount:.2f}
    
    Next Steps:
    - Web check-in opens 24 hours before departure
    - Arrive at airport 2 hours before departure
    - Bring valid ID matching passenger name
    
    This is an automated message. Please do not reply.
    """
    
    await send_email(to_email, subject, html_content, plain_content)


async def send_cancellation_email(
    to_email: str,
    booking_reference: str,
    passenger_name: str,
    refund_amount: float,
    currency: str
):
    """Send cancellation/refund confirmation email"""
    
    subject = f"Booking Cancelled - {booking_reference}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #dc2626; color: white; padding: 20px; text-align: center; }}
            .content {{ background: #f9fafb; padding: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Booking Cancelled</h1>
            </div>
            
            <div class="content">
                <p>Dear {passenger_name},</p>
                <p>Your booking <strong>{booking_reference}</strong> has been cancelled.</p>
                <p>Refund of <strong>{currency} {refund_amount:.2f}</strong> will be processed to your original payment method within 5-7 business days.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email(to_email, subject, html_content)