import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from datetime import datetime
import admin_models
from dotenv import load_dotenv

def send_email(db: Session, to_email: str, subject: str, body: str, html_body: str = None, tenant_id: any = None, logo_url: str = None, log_to_tenant: bool = False):
    # Try to load .env only if it exists (for local development)
    from pathlib import Path
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
    
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    smtp_from = os.getenv("SMTP_FROM")
    
    # Selection of logging model
    if log_to_tenant:
        import models
        EmailLogClass = models.SegEmailLog
        # For tenant-side logging, we usually use a fixed tenantId or 1 within the schema
        # unless specifically instructed otherwise.
        actual_tenant_id = 1 
    else:
        EmailLogClass = admin_models.SegEmailLog
        actual_tenant_id = tenant_id

    if not smtp_host:
        print("Error: SMTP_HOST environment variable is not set.")
        db_log = EmailLogClass(
            log_destinatario=to_email,
            log_asunto=subject,
            log_cuerpo=body,
            log_estado='ERROR',
            log_error="SMTP Configuration Missing (SMTP_HOST)",
            log_tenantId=actual_tenant_id
        )
        db.add(db_log)
        db.commit()
        return False
    
    # Create log entry
    db_log = EmailLogClass(
        log_destinatario=to_email,
        log_asunto=subject,
        log_cuerpo=body,
        log_estado='PENDIENTE',
        log_tenantId=actual_tenant_id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_from
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach plain text part
        part1 = MIMEText(body, 'plain')
        msg.attach(part1)
        
        # Attach HTML part if provided
        if html_body:
            if logo_url and "{{LOGO_URL}}" in html_body:
                html_body = html_body.replace("{{LOGO_URL}}", logo_url)
            elif logo_url and '<div class="header">' in html_body:
                logo_html = f'<img src="{logo_url}" alt="Logo" style="max-height: 80px; margin-bottom: 15px;"><br>'
                html_body = html_body.replace('<h2>', f'{logo_html}<h2>')

            part2 = MIMEText(html_body, 'html')
            msg.attach(part2)

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()

        db_log.log_estado = 'ENVIADO'
        db.commit()
        return True
    except Exception as e:
        db_log.log_estado = 'ERROR'
        db_log.log_error = str(e)
        db.commit()
        print(f"Error sending email: {e}")
        return False
