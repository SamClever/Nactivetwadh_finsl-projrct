from django.urls import path
from . import views

urlpatterns = [
    path('countries/', views.CountryList.as_view(), name='countries'),
    path('regions/', views.RegionList.as_view(), name='regions'),
    path('cities/', views.CityList.as_view(), name='cities'),
    path('districts/', views.DistrictList.as_view(), name='districts'),
    path('wards/', views.WardList.as_view(), name='wards'),
    path('streets/', views.StreetList.as_view(), name='streets'),
]
