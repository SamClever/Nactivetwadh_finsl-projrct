from rest_framework import serializers
from . import models


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Country
        fields = ('id', 'name', 'code')


class RegionSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)

    class Meta:
        model = models.Region
        fields = ('id', 'name', 'country')


class CitySerializer(serializers.ModelSerializer):
    region = RegionSerializer(read_only=True)

    class Meta:
        model = models.City
        fields = ('id', 'name', 'region')


class DistrictSerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)

    class Meta:
        model = models.District
        fields = ('id', 'name', 'city')


class WardSerializer(serializers.ModelSerializer):
    district = DistrictSerializer(read_only=True)

    class Meta:
        model = models.Ward
        fields = ('id', 'name', 'district')


class StreetSerializer(serializers.ModelSerializer):
    ward = WardSerializer(read_only=True)

    class Meta:
        model = models.Street
        fields = ('id', 'name', 'ward')
