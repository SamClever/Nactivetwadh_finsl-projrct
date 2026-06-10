#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from accounts.models import User

ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@nactvet.local')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'AdminPass2026!')
ADMIN_FIRST_NAME = os.environ.get('ADMIN_FIRST_NAME', 'Admin')
ADMIN_LAST_NAME = os.environ.get('ADMIN_LAST_NAME', 'User')
ADMIN_PHONE = os.environ.get('ADMIN_PHONE', '+255000000000')

# Remove existing admin user if the email or username already exists.
User.objects.filter(email=ADMIN_EMAIL).delete()
User.objects.filter(username=ADMIN_USERNAME).delete()

admin_user = User.objects.create(
    first_name=ADMIN_FIRST_NAME,
    last_name=ADMIN_LAST_NAME,
    username=ADMIN_USERNAME,
    email=ADMIN_EMAIL,
    phone=ADMIN_PHONE,
    password=make_password(ADMIN_PASSWORD),
    role='admin'
)

print('✓ Admin user created successfully.')
print(f'  Username: {admin_user.username}')
print(f'  Email: {admin_user.email}')
print(f'  Password: {ADMIN_PASSWORD}')
print('Use the email/password above to log in through the management portal or API.')
