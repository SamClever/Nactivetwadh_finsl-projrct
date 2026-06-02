import logging
import random

from django.utils import timezone
from django.contrib.auth.hashers import check_password

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
    
)

from .serializers import (
    ApplicationSerializer,
    UserSerializer,
    InstitutionSerializer,
    RegisterSerializer,
    DocumentSerializer, 
    PaymentSerializer
)


logger = logging.getLogger(__name__)


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
        if pk:
            try:
                instance=Institution.objects.get(id=pk)
                serializer=InstitutionSerializer(instance)
                return Response(serializer.data)
            except Institution.DoesNotExist:
                return Response({"error":"Not found"}, status=404)
        
        instances=Institution.objects.all()
        serializer=InstitutionSerializer(instances, many=True)
        return Response(serializer.data)
    
    # POST - create new institution (requires auth to set user)
    elif request.method=="POST":
        try:
            auth_header=request.headers.get("Authorization")
            if not auth_header:
                return Response({"error":"No Authorization header"}, status=401)
            
            token=auth_header.split(" ")[1]
            decoded=AccessToken(token)
            user_id=decoded["user_id"]
            user=User.objects.get(id=user_id)
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

    username=request.data.get(
        "username"
    )

    password=request.data.get(
        "password"
    )

    try:

        user=User.objects.get(
            username=username
        )


        matched=check_password(

            password,
            user.password

        )


        if matched:

            refresh=RefreshToken()

            refresh["user_id"]=user.id

            refresh["username"]=user.username


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

        auth_header=request.headers.get(
            "Authorization"
        )


        print(
            "HEADER:",
            auth_header
        )


        if auth_header is None:

            return Response(

                {

                "error":
                "No Authorization header"

                },

                status=401

            )


        token=auth_header.split(
            " "
        )[1]


        print(
            "TOKEN:",
            token
        )


        decoded=AccessToken(
            token
        )


        print(
            "DECODED:",
            decoded
        )


        user_id=decoded["user_id"]


        user=User.objects.get(
            id=user_id
        )


        institution=Institution.objects.get(
            user=user
        )


        print(
            "USER:",
            user.username
        )


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

        auth_header=request.headers.get(
            "Authorization"
        )

        if not auth_header:

            return Response(

                {
                    "error":"No token"
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

        auth_header = request.headers.get(
            "Authorization"
        )


        if not auth_header:

            return Response(

                {
                    "error": "No token"
                },

                status=401

            )


        token = auth_header.split(
            " "
        )[1]


        decoded = AccessToken(
            token
        )


        user_id = decoded["user_id"]


        user = User.objects.get(
            id=user_id
        )


        institution = Institution.objects.get(
            user=user
        )


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

            while True:

                control_number = (

                    "CTRL-"

                    +

                    str(

                        random.randint(
                            100000,
                            999999
                        )

                    )

                )


                if not Payment.objects.filter(

                    control_number=
                    control_number

                ).exists():

                    break



            payment = serializer.save(

                application=application,

                control_number=
                control_number

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



        serializer = PaymentSerializer(

            payment,

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