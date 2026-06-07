# Generated migration file for expanded Institution fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_payment_expires_at_payment_paid_at_and_more'),
    ]

    operations = [
        # Add phone field to User model
        migrations.AddField(
            model_name='user',
            name='phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),

        # Add expanded fields to Institution model
        migrations.AddField(
            model_name='institution',
            name='institution_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('technical', 'Technical School'),
                    ('vocational', 'Vocational Training Centre'),
                    ('institute', 'Technical Institute'),
                    ('university', 'Technical University'),
                    ('other', 'Other'),
                ],
                max_length=50,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='institution',
            name='registration_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='certificate_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='owner_title',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='principal_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='principal_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='principal_phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='street_address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='region',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='district',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='programs_offered',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='total_students',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='total_staff',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='facility_status',
            field=models.CharField(
                blank=True,
                choices=[
                    ('excellent', 'Excellent'),
                    ('good', 'Good'),
                    ('fair', 'Fair'),
                    ('poor', 'Poor'),
                    ('under_development', 'Under Development'),
                ],
                max_length=50,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='institution',
            name='has_library',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='institution',
            name='has_laboratory',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='institution',
            name='has_workshop',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='institution',
            name='accreditation_status',
            field=models.CharField(
                blank=True,
                choices=[
                    ('seeking', 'Seeking Accreditation'),
                    ('accredited', 'Fully Accredited'),
                    ('provisional', 'Provisionally Accredited'),
                    ('renewal', 'Accreditation Renewal'),
                ],
                max_length=50,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='institution',
            name='previous_accreditation',
            field=models.CharField(
                blank=True,
                choices=[
                    ('none', 'Never Accredited'),
                    ('approved', 'Previously Approved'),
                    ('accredited', 'Previously Accredited'),
                    ('revoked', 'Accreditation Revoked'),
                ],
                max_length=50,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='institution',
            name='years_operation',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
