from enum import member

from django.contrib import admin

# Register your models here.
from .models import User, Institution , Application, Inspection , Document, Payment, Review , InspectionTeam , Certificate,InspectionResponse , FormQuestion, InspectionForm,TeamMember
admin.site.register(User)
admin.site.register(Institution)
admin.site.register(Application)
admin.site.register(Inspection)
admin.site.register(Document)
admin.site.register(Payment)
admin.site.register(Review)
admin.site.register(InspectionTeam)
admin.site.register(Certificate)
admin.site.register(InspectionResponse)
admin.site.register(FormQuestion)
admin.site.register(InspectionForm)
admin.site.register(TeamMember)
