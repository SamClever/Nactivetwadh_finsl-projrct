from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('code', models.CharField(blank=True, max_length=8, null=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('country', models.ForeignKey(on_delete=models.CASCADE, related_name='regions', to='locations.country')),
            ],
            options={
                'ordering': ['name'],
                'unique_together': {('country', 'name')},
            },
        ),
        migrations.CreateModel(
            name='City',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('region', models.ForeignKey(on_delete=models.CASCADE, related_name='cities', to='locations.region')),
            ],
            options={
                'ordering': ['name'],
                'unique_together': {('region', 'name')},
            },
        ),
        migrations.CreateModel(
            name='District',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('city', models.ForeignKey(on_delete=models.CASCADE, related_name='districts', to='locations.city')),
            ],
            options={
                'ordering': ['name'],
                'unique_together': {('city', 'name')},
            },
        ),
        migrations.CreateModel(
            name='Ward',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('district', models.ForeignKey(on_delete=models.CASCADE, related_name='wards', to='locations.district')),
            ],
            options={
                'ordering': ['name'],
                'unique_together': {('district', 'name')},
            },
        ),
        migrations.CreateModel(
            name='Street',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
                ('ward', models.ForeignKey(on_delete=models.CASCADE, related_name='streets', to='locations.ward')),
            ],
            options={
                'ordering': ['name'],
                'unique_together': {('ward', 'name')},
            },
        ),
    ]
