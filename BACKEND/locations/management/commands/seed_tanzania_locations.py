from django.core.management.base import BaseCommand
from locations.models import Country, Region, City, District, Ward, Street


TANZANIA_REGIONS = [
    'Arusha',
    'Dar es Salaam',
    'Dodoma',
    'Geita',
    'Iringa',
    'Kagera',
    'Katavi',
    'Kigoma',
    'Kilimanjaro',
    'Lindi',
    'Manyara',
    'Mara',
    'Mbeya',
    'Morogoro',
    'Mtwara',
    'Mwanza',
    'Njombe',
    'Pwani',
    'Rukwa',
    'Ruvuma',
    'Shinyanga',
    'Simiyu',
    'Singida',
    'Songwe',
    'Tabora',
    'Tanga',
    'Zanzibar North',
    'Zanzibar South and Central',
    'Zanzibar Urban West',
    'Pemba North',
    'Pemba South',
]


class Command(BaseCommand):
    help = 'Seed Tanzania location master data into the locations app.'

    def handle(self, *args, **options):
        country, _ = Country.objects.get_or_create(name='Tanzania', code='TZA')

        for region_name in TANZANIA_REGIONS:
            region, created = Region.objects.get_or_create(country=country, name=region_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created region: {region_name}'))
            else:
                self.stdout.write(f'Region already exists: {region_name}')

            city_name = f'{region_name} City'
            city, _ = City.objects.get_or_create(region=region, name=city_name)

            district_name = f'{region_name} District'
            district, _ = District.objects.get_or_create(city=city, name=district_name)

            ward_name = f'{region_name} Ward'
            ward, _ = Ward.objects.get_or_create(district=district, name=ward_name)

            street_name = f'{region_name} Street'
            Street.objects.get_or_create(ward=ward, name=street_name)

        self.stdout.write(self.style.SUCCESS('Tanzania location master data seeded successfully.'))
