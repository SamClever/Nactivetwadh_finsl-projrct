from rest_framework import serializers
from django.contrib.auth.hashers import make_password


from .models import User, Institution ,Application,  Document,Payment,PaymentAuditLog,Review, InspectionTeam, TeamMember,  InspectionForm,  FormQuestion,    Inspection,  InspectionResponse,  Certificate

   
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'






class InstitutionSerializer(serializers.ModelSerializer):

    username=serializers.CharField(
        source='user.username',
        read_only=True
    )

    email=serializers.EmailField(
        source='user.email',
        read_only=True
    )

    class Meta:

        model=Institution

        fields=[

            'id',

            'institution_name',

            'institution_owner',

            'location',

            'username',

            'email'

        ]
class RegisterSerializer(serializers.Serializer):

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

    institution_name = serializers.CharField()
    institution_owner = serializers.CharField()
    location = serializers.CharField()

    def create(self, validated_data):

        user = User.objects.create(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            username=validated_data['username'],
            email=validated_data['email'],
            password=make_password(validated_data['password']),
            role='institution'
        )

        Institution.objects.create(
            user=user,
            institution_name=validated_data['institution_name'],
            institution_owner=validated_data['institution_owner'],
            location=validated_data['location']
        )

        return user

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
class ApplicationSerializer(serializers.ModelSerializer):

    class Meta:

        model=Application

        fields='__all__'

        read_only_fields=(

            'institution',

            'reference_number',

            'submission_date',

            'created_at'

        )





class DocumentSerializer(serializers.ModelSerializer):

    class Meta:

        model = Document

        fields = [

            'id',

            'application',

            'document_name',

            'document_type',

            'file',

            'status',

            'uploaded_at'

        ]

        read_only_fields = [

            'status',

            'uploaded_at'

        ]

class PaymentAuditLogSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', default=None)

    class Meta:
        model = PaymentAuditLog
        fields = [
            'id',
            'action',
            'details',
            'user',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'action',
            'details',
            'user',
            'created_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    application_reference = serializers.CharField(
        source='application.reference_number',
        read_only=True
    )
    institution_name = serializers.CharField(
        source='application.institution.institution_name',
        read_only=True
    )
    payer_name = serializers.CharField(
        source='application.institution.institution_owner',
        read_only=True
    )
    is_expired = serializers.SerializerMethodField()
    audit_logs = PaymentAuditLogSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'application',
            'application_reference',
            'institution_name',
            'payer_name',
            'amount',
            'control_number',
            'payment_method',
            'status',
            'receipt_number',
            'transaction_reference',
            'paid_at',
            'expires_at',
            'is_expired',
            'created_at',
            'audit_logs'
        ]
        extra_kwargs = {
            'amount': {'required': False},
            'payment_method': {'required': False},
        }
        read_only_fields = [
            'id',
            'created_at',
            'control_number',
            'application_reference',
            'institution_name',
            'payer_name',
            'is_expired',
            'audit_logs'
        ]

    def get_is_expired(self, obj):
        return obj.is_expired
class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = '__all__'



class InspectionTeamSerializer(serializers.ModelSerializer):

    class Meta:
        model = InspectionTeam
        fields = '__all__'




class TeamMemberSerializer(serializers.ModelSerializer):

    class Meta:
        model = TeamMember
        fields = '__all__'



class InspectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Inspection
        fields = '__all__'


class InspectionFormSerializer(serializers.ModelSerializer):

    class Meta:
        model = InspectionForm
        fields = '__all__'




class FormQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = FormQuestion
        fields = '__all__'



class InspectionResponseSerializer(serializers.ModelSerializer):

    class Meta:
        model = InspectionResponse
        fields = '__all__'



class CertificateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Certificate
        fields = '__all__'