import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from core.config import settings


def send_email(recipient: str, subject: str, html_body: str, text_body: str | None = None) -> None:
    msg = MIMEMultipart("alternative")
    msg["From"] = settings.SMTP_FROM
    msg["To"] = recipient
    msg["Subject"] = subject

    if text_body:
        msg.attach(MIMEText(text_body, "plain", "utf-8"))

    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USERNAME, recipient, msg.as_string())