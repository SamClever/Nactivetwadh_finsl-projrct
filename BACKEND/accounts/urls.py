from django.urls import path

from rest_framework_simplejwt.views import (

TokenObtainPairView,
TokenRefreshView

)

from .views import (

manage_applications,
manage_documents,
manage_payments,
register,
login,
manage_users,
manage_institutions,
api_root,
management_profile,
management_summary,
management_applications,
management_institutions,
management_payments,
management_reviews,
management_inspections,
management_inspection_forms,
management_form_questions,
management_inspection_teams,
management_inspection_responses,
management_certificates,
management_users,

)




urlpatterns=[

path(
    '',
    api_root
),

path(
'register/',
register
),

path(
'login/',
login
),

path(

'token/',

TokenObtainPairView.as_view(),

name='token_obtain_pair'

),

path(

'token/refresh/',

TokenRefreshView.as_view(),

name='token_refresh'

),

path(
'users/',
manage_users
),

path(
'users/<int:pk>/',
manage_users
),

path(
'institutions/',
manage_institutions
),

path(
'institutions/<int:pk>/',
manage_institutions
),

path(
'applications/',
manage_applications
),
path(
'applications/<int:pk>/',
manage_applications
),
path(
'documents/',
manage_documents
),

path(
'documents/<int:pk>/',
manage_documents
),

path(
    'payments/',
    manage_payments
),

path(
    'payments/<int:pk>/',
    manage_payments
),

path(
    'management/profile/',
    management_profile
),

path(
    'management/summary/',
    management_summary
),

path(
    'management/applications/',
    management_applications
),

path(
    'management/institutions/',
    management_institutions
),

path(
    'management/payments/',
    management_payments
),

path(
    'management/reviews/',
    management_reviews
),

path(
    'management/inspections/',
    management_inspections
),

path(
    'management/inspection-forms/',
    management_inspection_forms
),

path(
    'management/form-questions/',
    management_form_questions
),

path(
    'management/inspection-teams/',
    management_inspection_teams
),

path(
    'management/inspection-responses/',
    management_inspection_responses
),

path(
    'management/certificates/',
    management_certificates
),

path(
    'management/users/',
    management_users
),

]
