import smtplib

def sendMail(config, receivers, subject, text):
    connection = smtplib.SMTP(config['host'], config['port'])
    connection.ehlo()
    connection.starttls()
    connection.ehlo()
    connection.login(config['username'], config['password'])
    connection.sendmail(config['sender'], receivers, '\r\n'.join((
        "From: "+config['sender'],
        "To: "+', '.join(receivers),
        "Subject: "+subject,
        "",
        text
    )))
    connection.quit()
    return