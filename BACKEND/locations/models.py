from django.db import models


class Country(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=8, blank=True, null=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Region(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='regions')
    name = models.CharField(max_length=200)

    class Meta:
        ordering = ['name']
        unique_together = ('country', 'name')

    def __str__(self):
        return f"{self.name} ({self.country.code or self.country.name})"


class City(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='cities')
    name = models.CharField(max_length=200)

    class Meta:
        ordering = ['name']
        unique_together = ('region', 'name')

    def __str__(self):
        return f"{self.name}, {self.region.name}"


class District(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=200)

    class Meta:
        ordering = ['name']
        unique_together = ('city', 'name')

    def __str__(self):
        return f"{self.name}, {self.city.name}"


class Ward(models.Model):
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='wards')
    name = models.CharField(max_length=200)

    class Meta:
        ordering = ['name']
        unique_together = ('district', 'name')

    def __str__(self):
        return f"{self.name}, {self.district.name}"


class Street(models.Model):
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='streets')
    name = models.CharField(max_length=250)

    class Meta:
        ordering = ['name']
        unique_together = ('ward', 'name')

    def __str__(self):
        return f"{self.name}, {self.ward.name}"
