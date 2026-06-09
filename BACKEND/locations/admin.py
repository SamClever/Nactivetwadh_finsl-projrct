from django.contrib import admin
from . import models


@admin.register(models.Country)
class CountryAdmin(admin.ModelAdmin):
    search_fields = ('name', 'code')


@admin.register(models.Region)
class RegionAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    list_filter = ('country',)


@admin.register(models.City)
class CityAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    list_filter = ('region',)


@admin.register(models.District)
class DistrictAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    list_filter = ('city',)


@admin.register(models.Ward)
class WardAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    list_filter = ('district',)


@admin.register(models.Street)
class StreetAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    list_filter = ('ward',)
