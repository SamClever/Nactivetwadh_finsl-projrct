from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_application_application_description_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='institution',
            name='city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='ward',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='institution',
            name='street',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
