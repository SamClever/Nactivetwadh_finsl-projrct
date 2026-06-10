import logging
import random
from datetime import timedelta

from django.utils import timezone
from django.contrib.auth.hashers import check_password, make_password

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken


from .models import (
    User,
    Institution,
    Application,
    Document,
    Payment,
    PaymentAuditLog,
    Review,
    Inspection,
    InspectionForm,
    FormQuestion,
    InspectionTeam,
    TeamMember,
    InspectionResponse,
    Certificate,
)

from .serializers import (
    ApplicationSerializer,
    UserSerializer,
    InstitutionSerializer,
    RegisterSerializer,
    DocumentSerializer, 
    PaymentSerializer
)


def create_payment_audit_log(payment, user, action, details=None):
    PaymentAuditLog.objects.create(
        payment=payment,
        user=user,
        action=action,
        details=details or ''
    )


def compute_expiry_date():
    return timezone.now() + timedelta(days=7)


DEFAULT_PAYMENT_AMOUNT = 100000

logger = logging.getLogger(__name__)


def get_authorization_header(request):
    """Return the Authorization header from the request.

    Some server setups populate Authorization in request.META under
    HTTP_AUTHORIZATION or Authorization, while others expose it via
    request.headers.
    """
    auth_header = None

    if hasattr(request, 'headers'):
        auth_header = request.headers.get('Authorization')

    if not auth_header:
        auth_header = request.META.get('HTTP_AUTHORIZATION') or request.META.get('Authorization')

    if isinstance(auth_header, bytes):
        auth_header = auth_header.decode('utf-8', errors='ignore')

    return auth_header.strip() if auth_header else None


def get_bearer_token(request):
    auth_header = get_authorization_header(request)
    if not auth_header:
        return None

    auth_header = auth_header.strip()
    if auth_header.lower().startswith('bearer '):
        return auth_header[7:].strip()

    return auth_header


def get_authenticated_user(request):
    token = get_bearer_token(request)
    if not token:
        raise ValueError('Missing authorization token')

    decoded = AccessToken(token)
    user_id = decoded.get('user_id')
    if not user_id:
        raise ValueError('Invalid token payload')

    return User.objects.get(id=user_id)


def require_management_role(request, allowed_roles=None):
    try:
        user = get_authenticated_user(request)
    except Exception as e:
        raise ValueError(str(e))

    if user.role == 'institution':
        raise PermissionError('Management access denied')

    if allowed_roles and user.role not in allowed_roles:
        raise PermissionError('Permission denied for this management resource')

    return user


# =========================================
# GENERIC CRUD API
# =========================================


# API root
@api_view(['GET'])
def api_root(request):
    """Simple root for the API mounted at /api/ to avoid a 404.

    Returns a short JSON listing of available top-level endpoints.
    """
    return Response({
        "message": "API root",
        "endpoints": [
            "register/",
            "login/",
            "token/",
            "users/",
            "institutions/",
            "applications/",
            "documents/",
            "payments/",
        ]
    })

def generic_api(model_class, serializer_class):

    @api_view(['GET','POST','PUT','DELETE'])
    def api_handler(request, pk=None):

        if request.method=="GET":

            if pk:

                try:

                    instance=model_class.objects.get(
                        id=pk
                    )

                    serializer=serializer_class(
                        instance
                    )

                    return Response(
                        serializer.data
                    )

                except model_class.DoesNotExist:

                    return Response(
                        {"error":"Not found"},
                        status=404
                    )


            instances=model_class.objects.all()


            serializer=serializer_class(

                instances,

                many=True

            )


            return Response(
                serializer.data
            )


        elif request.method=="POST":

            serializer= serializer_class(
                data=request.data
            )


            if serializer.is_valid():

                serializer.save()

                return Response(

                    serializer.data,

                    status=201

                )


            return Response(

                serializer.errors,

                status=400

            )


    return api_handler



# =========================================
# CRUD APIs
# =========================================

manage_users=generic_api(
User,
UserSerializer
)


@api_view(['GET','POST','PUT','DELETE'])
def manage_institutions(request, pk=None):
    """Handle institution CRUD with user authentication for create."""
    
    # GET - list all or retrieve one
    if request.method=="GET":
        try:
            user = get_authenticated_user(request)
        except Exception as e:
            return Response({"error": str(e)}, status=401)

        if pk:
            try:
                instance=Institution.objects.get(id=pk)
                serializer=InstitutionSerializer(instance)
                return Response(serializer.data)
            except Institution.DoesNotExist:
                return Response({"error":"Not found"}, status=404)

        try:
            institution = Institution.objects.get(user=user)
            serializer = InstitutionSerializer(institution)
            return Response(serializer.data)
        except Institution.DoesNotExist:
            return Response({}, status=200)
    
    # POST - create new institution (requires auth to set user)
    elif request.method=="POST":
        try:
            user = get_authenticated_user(request)
        except Exception as e:
            return Response({"error": str(e)}, status=401)
        
        # Check if user already has an institution
        try:
            institution=Institution.objects.get(user=user)
            # Update existing institution
            serializer=InstitutionSerializer(institution, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)
        except Institution.DoesNotExist:
            # Create new institution
            serializer=InstitutionSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
    
    # PUT - update (for now, no auth required, could add if needed)
    elif request.method=="PUT":
        if not pk:
            return Response({"error":"pk required for update"}, status=400)
        try:
            institution=Institution.objects.get(id=pk)
        except Institution.DoesNotExist:
            return Response({"error":"Institution not found"}, status=404)
        
        serializer=InstitutionSerializer(institution, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    # DELETE
    elif request.method=="DELETE":
        if not pk:
            return Response({"error":"pk required for delete"}, status=400)
        try:
            institution=Institution.objects.get(id=pk)
        except Institution.DoesNotExist:
            return Response({"error":"Institution not found"}, status=404)
        
        institution.delete()
        return Response({"message":"Institution deleted successfully"})



# =========================================
# REGISTER
# =========================================

@api_view(['POST'])
def register(request):

    serializer=RegisterSerializer(
        data=request.data
    )


    if serializer.is_valid():

        serializer.save()

        return Response(

            {

            "message":
            "Registered successfully"

            },

            status=201

        )


    return Response(

        serializer.errors,

        status=400

    )



# =========================================
# LOGIN
# =========================================
@api_view(['POST'])
def login(request):

    email=request.data.get(
        "email"
    )

    password=request.data.get(
        "password"
    )

    try:

        user=User.objects.get(
            email=email
        )


        matched=check_password(

            password,
            user.password

        )


        if matched:

            refresh = RefreshToken.for_user(user)
            refresh["username"] = user.username

            return Response({

                "message":
                "Login successful",

                "access":
                str(
                    refresh.access_token
                ),

                "refresh":
                str(refresh),

                "user":{

                    "user_id":
                    user.id,

                    "username":
                    user.username,

                    "email":
                    user.email,

                    "role":
                    user.role

                }

            })


        return Response(

            {

            "error":
            "Invalid password"

            },

            status=401

        )


    except User.DoesNotExist:

        return Response(

            {

            "error":
            "User not found"

            },

            status=404

        )

# =========================================
# APPLICATIONS
# =========================================
@api_view(['GET','POST','PUT','DELETE'])
def manage_applications(request,pk=None):

    print("APPLICATION API HIT")


    try:
        user = get_authenticated_user(request)
        institution = Institution.objects.get(user=user)
    except Exception as e:

        print(
            "JWT ERROR:",
            str(e)
        )


        return Response(

            {

            "error":
            str(e)

            },

            status=401

        )



    # GET ALL APPLICATIONS

    if request.method=="GET":

        applications=Application.objects.filter(

            institution=institution

        ).order_by("-id")


        serializer=ApplicationSerializer(

            applications,

            many=True

        )


        return Response(
            serializer.data
        )



    # CREATE APPLICATION

    elif request.method=="POST":

        serializer=ApplicationSerializer(
            data=request.data
        )


        if serializer.is_valid():

            last_application=Application.objects.last()


            if last_application:

                last_id=last_application.id + 1

            else:

                last_id=1


            reference=f"APP-{last_id:03d}"


            serializer.save(

                institution=institution,

                reference_number=reference,

                submission_date=timezone.now()

            )


            return Response(

                serializer.data,

                status=201

            )


        return Response(

            serializer.errors,

            status=400

        )



    # UPDATE APPLICATION

    elif request.method=="PUT":

        try:

            application=Application.objects.get(

                id=pk,

                institution=institution

            )


        except Application.DoesNotExist:

            return Response(

                {

                "error":
                "Application not found"

                },

                status=404

            )


        serializer=ApplicationSerializer(

            application,

            data=request.data,

            partial=True

        )


        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )


        return Response(

            serializer.errors,

            status=400

        )



    # DELETE APPLICATION

    elif request.method=="DELETE":

        try:

            application=Application.objects.get(

                id=pk,

                institution=institution

            )


        except Application.DoesNotExist:

            return Response(

                {

                "error":
                "Application not found"

                },

                status=404

            )


        application.delete()


        return Response(

            {

            "message":
            "Application deleted successfully"

            }

        )
    
#DOCUMMENTS

@api_view(['GET','POST','PUT','DELETE'])
def manage_documents(request,pk=None):

    try:
        user = get_authenticated_user(request)
        institution = Institution.objects.get(user=user)
    except Exception as e:

        print(
            "DOCUMENT JWT ERROR:",
            e
        )

        return Response(

            {

            "error":
            str(e)

            },

            status=401

        )

    # GET ALL DOCUMENTS

    if request.method=="GET":

        documents=Document.objects.filter(

            application__institution= institution

        ).order_by(

            "-uploaded_at"

        )

        serializer=DocumentSerializer(

            documents,

            many=True

        )

        return Response(
            serializer.data
        )


    # CREATE

    elif request.method=="POST":

        serializer=DocumentSerializer(
            data=request.data
        )


        if serializer.is_valid():

            application_id=request.data.get(
                "application"
            )


            try:

                application=Application.objects.get(

                    id=application_id,

                    institution=institution

                )


            except Application.DoesNotExist:

                return Response(

                    {

                    "error":
                    "Application not found"

                    },

                    status=404

                )


            serializer.save(

                application=application

            )


            return Response(

                serializer.data,

                status=201

            )


        return Response(

            serializer.errors,

            status=400

        )



    # UPDATE

    elif request.method=="PUT":

        try:

            document=Document.objects.get(

                id=pk,

                application__institution=institution

            )

        except Document.DoesNotExist:

            return Response(

                {

                "error":
                "Document not found"

                },

                status=404

            )


        serializer=DocumentSerializer(

            document,

            data=request.data,

            partial=True

        )


        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )


        return Response(

            serializer.errors,

            status=400

        )



    # DELETE

    elif request.method=="DELETE":

        try:

            document=Document.objects.get(

                id=pk,

                application__institution=institution

            )

        except Document.DoesNotExist:

            return Response(

                {

                "error":
                "Document not found"

                },

                status=404

            )


        document.delete()


        return Response(

            {

            "message":
            "Document deleted successfully"

            }

        )
    
    from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import AccessToken

from .models import (
    User,
    Institution
)

from .serializers import (
    InstitutionSerializer
)




@api_view(['GET','PUT'])
def manage_institution(request):


    try:

        auth_header=request.headers.get(
            "Authorization"
        )


        if not auth_header:

            return Response(

                {

                "error":
                "No token"

                },

                status=401

            )



        token=auth_header.split(
            " "
        )[1]



        decoded=AccessToken(token)



        user_id=decoded["user_id"]



        user=User.objects.get(
            id=user_id
        )



        institution=Institution.objects.get(
            user=user
        )



    except Exception as e:

        print(
            "INSTITUTION ERROR:",
            e
        )


        return Response(

            {

            "error":
            str(e)

            },

            status=401

        )





    # GET INSTITUTION

    if request.method=="GET":


        serializer=InstitutionSerializer(
            institution
        )


        return Response(
            serializer.data
        )





    # UPDATE INSTITUTION

    elif request.method=="PUT":


        serializer= InstitutionSerializer(

            institution,

            data=request.data,

            partial=True

        )



        if serializer.is_valid():

            serializer.save()


            return Response(
                serializer.data
            )



        return Response(

            serializer.errors,

            status=400

        )
        if serializer.is_valid():

           serializer.save()

           user.username=request.data.get(
        "username"
        )

           user.email=request.data.get(
        "email"
    )

    user.save()

    return Response(
        serializer.data
    )


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def manage_payments(request, pk=None):


    # =========================
    # AUTHENTICATION
    # =========================
    try:
        user = get_authenticated_user(request)
        institution = Institution.objects.get(user=user)
    except Exception as e:

        print(
            "PAYMENT JWT ERROR:",
            e
        )

        return Response(

            {
                "error": str(e)
            },

            status=401

        )



    # =========================
    # GET PAYMENTS
    # =========================

    if request.method == "GET":

        control_number = request.GET.get(
            'control_number'
        )

        if control_number:
            try:
                payment = Payment.objects.get(
                    control_number=control_number,
                    application__institution=institution
                )
            except Payment.DoesNotExist:
                return Response(
                    {
                        "error": "Control number not found"
                    },
                    status=404
                )

            serializer = PaymentSerializer(
                payment
            )
            return Response(serializer.data)

        payments = Payment.objects.filter(

            application__institution=
            institution

        ).order_by(

            "-created_at"

        )


        serializer = PaymentSerializer(

            payments,

            many=True

        )


        return Response(
            serializer.data
        )



    # =========================
    # CREATE PAYMENT
    # =========================

    elif request.method == "POST":

        serializer = PaymentSerializer(
            data=request.data
        )


        if serializer.is_valid():

            application_id = request.data.get(
                "application"
            )


            try:

                application = Application.objects.get(

                    id=application_id,

                    institution=institution

                )


            except Application.DoesNotExist:

                return Response(

                    {
                        "error":
                        "Application not found"
                    },

                    status=404

                )



            # =========================
            # GENERATE CONTROL NUMBER
            # =========================

            control_number = Payment.generate_unique_control_number()



            payment = serializer.save(
                application=application,
                control_number=control_number,
                amount=DEFAULT_PAYMENT_AMOUNT,
                payment_method='mobile_money',
                expires_at=compute_expiry_date()
            )

            create_payment_audit_log(
                payment,
                institution.user,
                action='Control number generated',
                details=f'Generated control number {control_number}'
            )



            return Response(

                PaymentSerializer(
                    payment
                ).data,

                status=201

            )



        return Response(

            serializer.errors,

            status=400

        )



    # =========================
    # UPDATE PAYMENT
    # =========================

    elif request.method == "PUT":

        try:

            payment = Payment.objects.get(

                id=pk,

                application__institution=
                institution

            )


        except Payment.DoesNotExist:

            return Response(

                {
                    "error":
                    "Payment not found"
                },

                status=404

            )



        regenerate_control_number = request.data.get(
            'regenerate_control_number'
        )

        if regenerate_control_number:
            if payment.status == 'paid':
                return Response(
                    {
                        'error':
                        'Cannot regenerate a paid payment'
                    },
                    status=400
                )

            new_control_number = Payment.generate_unique_control_number()
            payment.control_number = new_control_number
            payment.status = 'pending'
            payment.expires_at = compute_expiry_date()
            payment.save()

            create_payment_audit_log(
                payment,
                institution.user,
                action='Control number regenerated',
                details=f'Regenerated control number {new_control_number}'
            )

            return Response(
                PaymentSerializer(payment).data
            )

        serializer = PaymentSerializer(
            payment,
            data=request.data,
            partial=True
        )


        if serializer.is_valid():
            updated_payment = serializer.save()
            if updated_payment.status == 'paid':
                updated_payment.mark_paid()
                updated_payment.application.payment_status = 'paid'
                updated_payment.application.save(update_fields=['payment_status'])
                create_payment_audit_log(
                    updated_payment,
                    updated_payment.application.institution.user,
                    action='Payment confirmed',
                    details='Payment status updated to paid'
                )

            return Response(
                PaymentSerializer(updated_payment).data
            )



        return Response(

            serializer.errors,

            status=400

        )



    # =========================
    # DELETE PAYMENT
    # =========================

    elif request.method == "DELETE":

        try:

            payment = Payment.objects.get(

                id=pk,

                application__institution=
                institution

            )


        except Payment.DoesNotExist:

            return Response(

                {
                    "error":
                    "Payment not found"
                },

                status=404

            )



        payment.delete()


        return Response(

            {
                "message":
                "Payment deleted successfully"
            }

        )


# =========================================
# MANAGEMENT ENDPOINTS


def _error_response(exc):
    if isinstance(exc, PermissionError):
        return Response({"error": str(exc)}, status=403)
    return Response({"error": str(exc)}, status=401)


@api_view(['GET'])
def management_profile(request):
    try:
        user = require_management_role(request)
    except Exception as exc:
        return _error_response(exc)

    return Response({
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "permissions": {
            "can_view_users": user.role == 'admin',
            "can_manage_applications": user.role in ['admin', 'registry_officer', 'zonal_manager'],
            "can_manage_inspections": user.role in ['admin', 'inspector', 'zonal_manager'],
            "can_manage_reviews": user.role in ['admin', 'registry_officer'],
            "can_access_reports": user.role in ['admin', 'registry_officer', 'zonal_manager'],
        }
    })


@api_view(['GET'])
def management_summary(request):
    try:
        require_management_role(request)
    except Exception as exc:
        return _error_response(exc)

    applications = Application.objects.all()
    payments = Payment.objects.all()
    institutions = Institution.objects.all()
    inspections = Inspection.objects.all()
    certificates = Certificate.objects.all()
    reviews = Review.objects.all()

    status_counts = {
        status: applications.filter(status=status).count()
        for status, _ in Application.STATUS_CHOICES
    }
    payment_counts = {
        status: payments.filter(status=status).count()
        for status, _ in Payment.STATUS_CHOICES
    }
    institution_counts = {
        status: institutions.filter(accreditation_status=status).count()
        for status, _ in Institution.ACCREDITATION_STATUS_CHOICES
    }
    inspection_counts = {
        status: inspections.filter(inspection_status=status).count()
        for status, _ in Inspection.STATUS_CHOICES
    }
    certificate_counts = {
        status: certificates.filter(status=status).count()
        for status, _ in Certificate.STATUS_CHOICES
    }

    recent_reviews = [
        {
            "id": review.id,
            "application_reference": review.application.reference_number,
            "officer": review.officer.username,
            "decision": review.decision,
            "comments": review.comments,
            "date": review.review_date,
        }
        for review in reviews.order_by('-review_date')[:6]
    ]

    recent_payments = [
        {
            "id": payment.id,
            "application_reference": payment.application.reference_number,
            "institution_name": payment.application.institution.institution_name,
            "status": payment.status,
            "amount": float(payment.amount),
            "updated_at": payment.paid_at or payment.created_at,
        }
        for payment in payments.order_by('-created_at')[:6]
    ]

    recent_inspections = [
        {
            "id": inspection.id,
            "application_reference": inspection.application.reference_number,
            "scheduled_date": inspection.scheduled_date,
            "status": inspection.inspection_status,
        }
        for inspection in inspections.order_by('-scheduled_date')[:6]
    ]

    return Response({
        "totals": {
            "applications": applications.count(),
            "institutions": institutions.count(),
            "payments": payments.count(),
            "inspections": inspections.count(),
            "certificates": certificates.count(),
            "reviews": reviews.count(),
        },
        "status_counts": status_counts,
        "payment_counts": payment_counts,
        "institution_counts": institution_counts,
        "inspection_counts": inspection_counts,
        "certificate_counts": certificate_counts,
        "recent_reviews": recent_reviews,
        "recent_payments": recent_payments,
        "recent_inspections": recent_inspections,
        "workflow_queues": {
            "submitted_applications": applications.filter(status='submitted').count(),
            "under_review": applications.filter(status='under_review').count(),
            "inspection_ready": applications.filter(status='inspection').count(),
            "pending_payments": payments.filter(status='pending').count(),
            "pending_documents": Document.objects.filter(status='pending').count(),
        }
    })


def _apply_search_filter(queryset, search, fields):
    if not search:
        return queryset
    from django.db.models import Q
    query = Q()
    for field in fields:
        query |= Q(**{f"{field}__icontains": search})
    return queryset.filter(query)


@api_view(['GET'])
def management_applications(request):
    try:
        require_management_role(request, allowed_roles=['admin', 'registry_officer', 'zonal_manager', 'inspector'])
    except Exception as exc:
        return _error_response(exc)

    queryset = Application.objects.select_related('institution').all().order_by('-created_at')
    search = request.GET.get('search')
    status_filter = request.GET.get('status')

    if status_filter:
        queryset = queryset.filter(status=status_filter)

    queryset = _apply_search_filter(queryset, search, ['reference_number', 'category', 'application_type', 'institution__institution_name'])

    data = [
        {
            "id": app.id,
            "reference_number": app.reference_number,
            "institution_name": app.institution.institution_name,
            "application_type": app.application_type,
            "category": app.category,
            "status": app.status,
            "payment_status": app.payment_status,
            "review_status": app.review_status,
            "inspection_status": app.inspection_status,
            "submission_date": app.submission_date,
            "created_at": app.created_at,
        }
        for app in queryset
    ]

    return Response(data)


@api_view(['GET'])
def management_institutions(request):
    try:
        require_management_role(request)
    except Exception as exc:
        return _error_response(exc)

    queryset = Institution.objects.select_related('user').all().order_by('-created_at')
    search = request.GET.get('search')
    queryset = _apply_search_filter(queryset, search, ['institution_name', 'institution_owner', 'registration_number', 'user__email'])

    data = [
        {
            "id": inst.id,
            "institution_name": inst.institution_name,
            "registration_number": inst.registration_number,
            "accreditation_status": inst.accreditation_status,
            "facility_status": inst.facility_status,
            "institution_type": inst.institution_type,
            "location": inst.location or inst.city or inst.region,
            "owner": inst.institution_owner,
            "email": inst.user.email,
            "created_at": inst.created_at,
        }
        for inst in queryset
    ]

    return Response(data)


@api_view(['GET'])
def management_payments(request):
    try:
        require_management_role(request)
    except Exception as exc:
        return _error_response(exc)

    queryset = Payment.objects.select_related('application__institution').all().order_by('-created_at')
    search = request.GET.get('search')
    if search:
        queryset = queryset.filter(
            application__reference_number__icontains=search
        )
    status_filter = request.GET.get('status')
    if status_filter:
        queryset = queryset.filter(status=status_filter)

    data = [
        {
            "id": payment.id,
            "application_reference": payment.application.reference_number,
            "institution_name": payment.application.institution.institution_name,
            "amount": float(payment.amount),
            "status": payment.status,
            "payment_method": payment.payment_method,
            "control_number": payment.control_number,
            "receipt_number": payment.receipt_number,
            "paid_at": payment.paid_at,
            "created_at": payment.created_at,
        }
        for payment in queryset
    ]

    return Response(data)


@api_view(['GET', 'POST'])
def management_reviews(request):
    try:
        current_user = require_management_role(request, allowed_roles=['admin', 'registry_officer'])
    except Exception as exc:
        return _error_response(exc)

    if request.method == 'POST':
        application_id = request.data.get('application')
        decision = request.data.get('decision', 'pending')
        comments = request.data.get('comments', '')

        valid_decisions = [choice[0] for choice in Review.DECISION_CHOICES]
        if decision not in valid_decisions:
            return Response({"decision": "Select a valid review decision."}, status=400)

        if not application_id:
            return Response({"application": "This field is required."}, status=400)

        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            return Response({"error": "Application not found."}, status=404)

        review = Review.objects.create(
            application=application,
            officer=current_user,
            decision=decision,
            comments=comments,
        )

        application.review_status = decision
        if decision in ['approved', 'rejected', 'conditional']:
            application.status = decision
        elif application.status == 'submitted':
            application.status = 'under_review'
        application.save(update_fields=['review_status', 'status'])

        return Response({
            "id": review.id,
            "application": application.id,
            "application_reference": application.reference_number,
            "officer": current_user.username,
            "decision": review.decision,
            "comments": review.comments,
            "review_date": review.review_date,
            "application_status": application.status,
            "review_status": application.review_status,
        }, status=201)

    queryset = Review.objects.select_related('application', 'officer').order_by('-review_date')
    search = request.GET.get('search')
    if search:
        queryset = queryset.filter(
            application__reference_number__icontains=search
        )

    data = [
        {
            "id": review.id,
            "application": review.application.id,
            "application_reference": review.application.reference_number,
            "officer": review.officer.username,
            "decision": review.decision,
            "comments": review.comments,
            "review_date": review.review_date,
        }
        for review in queryset
    ]

    return Response(data)


@api_view(['GET', 'POST', 'PUT'])
def management_inspections(request):
    try:
        require_management_role(request, allowed_roles=['admin', 'inspector', 'zonal_manager'])
    except Exception as exc:
        return _error_response(exc)

    if request.method == 'POST':
        application_id = request.data.get('application')
        team_id = request.data.get('team')
        scheduled_date = request.data.get('scheduled_date')

        if not application_id or not team_id or not scheduled_date:
            return Response({"error": "Application, team, and scheduled date are required."}, status=400)

        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            return Response({"error": "Application not found."}, status=404)

        try:
            team = InspectionTeam.objects.get(id=team_id)
        except InspectionTeam.DoesNotExist:
            return Response({"error": "Inspection team not found."}, status=404)

        inspection = Inspection.objects.create(
            application=application,
            team=team,
            scheduled_date=scheduled_date,
            inspection_status='scheduled',
        )

        application.status = 'inspection'
        application.inspection_status = 'scheduled'
        application.save(update_fields=['status', 'inspection_status'])

        return Response({
            "id": inspection.id,
            "application": application.id,
            "application_reference": application.reference_number,
            "team": team.id,
            "scheduled_date": inspection.scheduled_date,
            "status": inspection.inspection_status,
            "result": inspection.inspection_result,
            "remarks": inspection.overall_remarks,
        }, status=201)

    if request.method == 'PUT':
        inspection_id = request.data.get('id') or request.GET.get('id')
        if not inspection_id:
            return Response({"error": "Inspection id is required."}, status=400)

        try:
            inspection = Inspection.objects.select_related('application').get(id=inspection_id)
        except Inspection.DoesNotExist:
            return Response({"error": "Inspection not found."}, status=404)

        inspection_status = request.data.get('status')
        result = request.data.get('result')
        remarks = request.data.get('remarks')

        if inspection_status:
            valid_statuses = [choice[0] for choice in Inspection.STATUS_CHOICES]
            if inspection_status not in valid_statuses:
                return Response({"status": "Select a valid inspection status."}, status=400)
            inspection.inspection_status = inspection_status
            inspection.application.inspection_status = inspection_status

        if result:
            valid_results = [choice[0] for choice in Inspection.RESULT_CHOICES]
            if result not in valid_results:
                return Response({"result": "Select a valid inspection result."}, status=400)
            inspection.inspection_result = result

        if remarks is not None:
            inspection.overall_remarks = remarks

        if inspection.inspection_status == 'completed' and not inspection.completed_at:
            inspection.completed_at = timezone.now()

        inspection.save()
        inspection.application.save(update_fields=['inspection_status'])

        return Response({
            "id": inspection.id,
            "application_reference": inspection.application.reference_number,
            "scheduled_date": inspection.scheduled_date,
            "status": inspection.inspection_status,
            "result": inspection.inspection_result,
            "remarks": inspection.overall_remarks,
        })

    queryset = Inspection.objects.select_related('application').order_by('-scheduled_date')
    search = request.GET.get('search')
    if search:
        queryset = queryset.filter(
            application__reference_number__icontains=search
        )

    data = [
        {
            "id": inspection.id,
            "application": inspection.application.id,
            "application_reference": inspection.application.reference_number,
            "team": inspection.team.id,
            "scheduled_date": inspection.scheduled_date,
            "status": inspection.inspection_status,
            "result": inspection.inspection_result,
            "remarks": inspection.overall_remarks,
        }
        for inspection in queryset
    ]

    return Response(data)


@api_view(['GET', 'POST'])
def management_inspection_forms(request):
    try:
        require_management_role(request, allowed_roles=['admin', 'inspector', 'zonal_manager'])
    except Exception as exc:
        return _error_response(exc)

    if request.method == 'POST':
        form_name = request.data.get('form_name')
        version = request.data.get('version')

        if not form_name or not version:
            return Response({
                "form_name": "This field is required.",
                "version": "This field is required.",
            }, status=400)

        form = InspectionForm.objects.create(form_name=form_name, version=version)
        return Response({
            "id": form.id,
            "form_name": form.form_name,
            "version": form.version,
            "created_at": form.created_at,
            "questions_count": 0,
        }, status=201)

    forms = InspectionForm.objects.all().order_by('-created_at')
    search = request.GET.get('search')
    forms = _apply_search_filter(forms, search, ['form_name', 'version'])

    return Response([
        {
            "id": form.id,
            "form_name": form.form_name,
            "version": form.version,
            "created_at": form.created_at,
            "questions_count": FormQuestion.objects.filter(form=form).count(),
        }
        for form in forms
    ])


@api_view(['GET', 'POST'])
def management_form_questions(request):
    try:
        require_management_role(request, allowed_roles=['admin', 'inspector', 'zonal_manager'])
    except Exception as exc:
        return _error_response(exc)

    if request.method == 'POST':
        form_id = request.data.get('form')
        question_text = request.data.get('question_text')
        expected_answer = request.data.get('expected_answer')

        if not form_id or not question_text or not expected_answer:
            return Response({"error": "Form, question text, and expected answer are required."}, status=400)

        try:
            form = InspectionForm.objects.get(id=form_id)
        except InspectionForm.DoesNotExist:
            return Response({"error": "Inspection form not found."}, status=404)

        question = FormQuestion.objects.create(
            form=form,
            question_text=question_text,
            expected_answer=expected_answer,
        )
        return Response({
            "id": question.id,
            "form": form.id,
            "form_name": form.form_name,
            "question_text": question.question_text,
            "expected_answer": question.expected_answer,
        }, status=201)

    questions = FormQuestion.objects.select_related('form').all().order_by('-id')
    form_id = request.GET.get('form')
    search = request.GET.get('search')

    if form_id:
        questions = questions.filter(form_id=form_id)

    questions = _apply_search_filter(questions, search, ['question_text', 'expected_answer', 'form__form_name'])

    return Response([
        {
            "id": question.id,
            "form": question.form.id,
            "form_name": question.form.form_name,
            "question_text": question.question_text,
            "expected_answer": question.expected_answer,
        }
        for question in questions
    ])


@api_view(['GET', 'POST'])
def management_inspection_teams(request):
    try:
        require_management_role(request, allowed_roles=['admin', 'inspector', 'zonal_manager'])
    except Exception as exc:
        return _error_response(exc)

    if request.method == 'POST':
        inspection_date = request.data.get('inspection_date')
        member_ids = request.data.get('member_ids', [])

        if not inspection_date:
            return Response({"inspection_date": "This field is required."}, status=400)

        team = InspectionTeam.objects.create(inspection_date=inspection_date)
        for member_id in member_ids:
            try:
                member = User.objects.get(id=member_id, role__in=['admin', 'inspector', 'zonal_manager'])
                TeamMember.objects.create(team=team, user=member)
            except User.DoesNotExist:
                continue

        return Response({
            "id": team.id,
            "inspection_date": team.inspection_date,
            "members": [
                {"id": member.user.id, "username": member.user.username, "role": member.user.role}
                for member in TeamMember.objects.filter(team=team).select_related('user')
            ],
            "created_at": team.created_at,
        }, status=201)

    teams = InspectionTeam.objects.all().order_by('-created_at')
    return Response([
        {
            "id": team.id,
            "inspection_date": team.inspection_date,
            "members": [
                {"id": member.user.id, "username": member.user.username, "role": member.user.role}
                for member in TeamMember.objects.filter(team=team).select_related('user')
            ],
            "created_at": team.created_at,
        }
        for team in teams
    ])


@api_view(['GET'])
def management_inspection_responses(request):
    try:
        require_management_role(request, allowed_roles=['admin', 'inspector', 'zonal_manager'])
    except Exception as exc:
        return _error_response(exc)

    responses = InspectionResponse.objects.select_related(
        'inspection__application',
        'question__form',
    ).order_by('-id')
    search = request.GET.get('search')
    if search:
        responses = responses.filter(inspection__application__reference_number__icontains=search)

    return Response([
        {
            "id": response.id,
            "application_reference": response.inspection.application.reference_number,
            "form_name": response.question.form.form_name,
            "question_text": response.question.question_text,
            "actual_answer": response.actual_answer,
            "expected_answer": response.question.expected_answer,
            "comments": response.comments,
            "score": response.score,
        }
        for response in responses
    ])


@api_view(['GET'])
def management_certificates(request):
    try:
        require_management_role(request)
    except Exception as exc:
        return _error_response(exc)

    queryset = Certificate.objects.select_related('application__institution').order_by('-created_at')
    search = request.GET.get('search')
    if search:
        queryset = queryset.filter(
            certificate_number__icontains=search
        )

    data = [
        {
            "id": cert.id,
            "certificate_number": cert.certificate_number,
            "serial_number": cert.serial_number,
            "application_reference": cert.application.reference_number,
            "institution_name": cert.application.institution.institution_name,
            "status": cert.status,
            "issue_date": cert.issue_date,
            "expiry_date": cert.expiry_date,
        }
        for cert in queryset
    ]

    return Response(data)


@api_view(['GET', 'POST'])
def management_users(request):
    try:
        current_user = require_management_role(request)
    except Exception as exc:
        return _error_response(exc)

    if request.method == 'POST':
        if current_user.role != 'admin':
            return Response({"error": "Only admins can create management accounts."}, status=403)

        role = request.data.get('role', 'registry_officer')
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES if choice[0] != 'institution']

        if role not in valid_roles:
            return Response({"role": "Select a valid management role."}, status=400)

        required_fields = ['first_name', 'last_name', 'username', 'email', 'password']
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response(
                {field: "This field is required." for field in missing_fields},
                status=400
            )

        password = request.data.get('password')
        if len(password) < 6:
            return Response({"password": "Password must be at least 6 characters long."}, status=400)

        username = request.data.get('username')
        email = request.data.get('email')

        if User.objects.filter(username=username).exists():
            return Response({"username": "Username already exists."}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"email": "Email already exists."}, status=400)

        user = User.objects.create(
            first_name=request.data.get('first_name'),
            last_name=request.data.get('last_name'),
            username=username,
            email=email,
            phone=request.data.get('phone', ''),
            password=make_password(password),
            role=role,
        )

        return Response({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at,
        }, status=201)

    queryset = User.objects.all().order_by('-created_at')
    search = request.GET.get('search')
    if search:
        queryset = _apply_search_filter(queryset, search, ['username', 'email', 'first_name', 'last_name', 'role'])

    data = [
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at,
        }
        for user in queryset
    ]

    return Response(data)
