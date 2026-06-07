#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from accounts.models import User, Institution

# Create a test user
email = "test@test.com"
password = "testpass123"

# Delete if exists
User.objects.filter(email=email).delete()

# Create new user
user = User.objects.create(
    first_name="Test",
    last_name="User",
    username="testuser",
    email=email,
    phone="1234567890",
    password=make_password(password),
    role="institution"
)

# Create Institution for the user
institution = Institution.objects.create(
    user=user,
    institution_name="Test Institution",
    institution_type="technical"
)

print(f"✓ Created user: {user.email}")
print(f"✓ Username: {user.username}")
print(f"✓ Password (for testing): {password}")
print(f"✓ Created institution: {institution.institution_name}")
print("\nNow test login with:")
print(f"  Email: {email}")
print(f"  Password: {password}")

