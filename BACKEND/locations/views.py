from rest_framework import generics, filters
from rest_framework.pagination import PageNumberPagination
from . import models, serializers


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 200


class CountryList(generics.ListAPIView):
    queryset = models.Country.objects.all()
    serializer_class = serializers.CountrySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']
    pagination_class = StandardResultsSetPagination


class RegionList(generics.ListAPIView):
    serializer_class = serializers.RegionSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = models.Region.objects.all()
        country = self.request.query_params.get('country')
        if country:
            qs = qs.filter(country_id=country)
        return qs


class CityList(generics.ListAPIView):
    serializer_class = serializers.CitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = models.City.objects.all()
        region = self.request.query_params.get('region')
        if region:
            qs = qs.filter(region_id=region)
        return qs


class DistrictList(generics.ListAPIView):
    serializer_class = serializers.DistrictSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = models.District.objects.all()
        city = self.request.query_params.get('city')
        if city:
            qs = qs.filter(city_id=city)
        return qs


class WardList(generics.ListAPIView):
    serializer_class = serializers.WardSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = models.Ward.objects.all()
        district = self.request.query_params.get('district')
        if district:
            qs = qs.filter(district_id=district)
        return qs


class StreetList(generics.ListAPIView):
    serializer_class = serializers.StreetSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = models.Street.objects.all()
        ward = self.request.query_params.get('ward')
        if ward:
            qs = qs.filter(ward_id=ward)
        return qs
