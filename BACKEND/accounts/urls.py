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
api_root

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


]