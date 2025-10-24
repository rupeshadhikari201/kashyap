from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings

sg = SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)

def send_sendgrid_mail(to_email, subject, plain_text, html=None):
    """
    Send via SendGrid HTTP API. Never raises, returns True/False.
    """
    mail = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        plain_text_content=plain_text,
        html_content=html or plain_text,
    )
    try:
        sg.send(mail)
        return True
    except Exception as exc:          # noqa: BLE001
        print("SendGrid error:", exc)
        return False
