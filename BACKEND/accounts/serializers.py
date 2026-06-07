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

    phone=serializers.CharField(
        source='user.phone',
        read_only=True
    )

    class Meta:

        model=Institution

        fields=[

            'id',
            'institution_name',
            'institution_type',
            'registration_number',
            'certificate_number',
            'institution_owner',
            'owner_title',
            'principal_name',
            'principal_email',
            'principal_phone',
            'street_address',
            'location',
            'region',
            'district',
            'programs_offered',
            'total_students',
            'total_staff',
            'facility_status',
            'has_library',
            'has_laboratory',
            'has_workshop',
            'accreditation_status',
            'previous_accreditation',
            'years_operation',
            'username',
            'email',
            'phone',
            'created_at',
            'updated_at'

        ]
class RegisterSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match'
            })

        if len(password) < 6:
            raise serializers.ValidationError({
                'password': 'Password must be at least 6 characters long'
            })

        return data

    def create(self, validated_data):
        user = User.objects.create(
            first_name='',
            last_name='',
            username=validated_data['email'],
            email=validated_data['email'],
            phone='',
            password=make_password(validated_data['password']),
            role='institution'
        )

        return user

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