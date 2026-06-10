#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from accounts.models import User


MANAGEMENT_USERS = [
    {
        'first_name': 'Registration',
        'last_name': 'Officer',
        'username': 'registration_officer',
        'email': 'registration.officer@nactvet.local',
        'phone': '+255000000101',
        'password': 'RegOfficer2026!',
        'role': 'registry_officer',
    },
    {
        'first_name': 'Zonal',
        'last_name': 'Manager',
        'username': 'zonal_manager',
        'email': 'zonal.manager@nactvet.local',
        'phone': '+255000000102',
        'password': 'ZonalManager2026!',
        'role': 'zonal_manager',
    },
    {
        'first_name': 'Field',
        'last_name': 'Inspector',
        'username': 'inspector',
        'email': 'inspector@nactvet.local',
        'phone': '+255000000103',
        'password': 'Inspector2026!',
        'role': 'inspector',
    },
]


for account in MANAGEMENT_USERS:
    User.objects.filter(email=account['email']).delete()
    User.objects.filter(username=account['username']).delete()

    user = User.objects.create(
        first_name=account['first_name'],
        last_name=account['last_name'],
        username=account['username'],
        email=account['email'],
        phone=account['phone'],
        password=make_password(account['password']),
        role=account['role'],
    )

    print(f"Created {user.role}: {user.email} / {account['password']}")

print('Management users created successfully.')
