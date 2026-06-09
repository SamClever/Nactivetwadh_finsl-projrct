import random
from datetime import timedelta

from django.db import models
from django.utils import timezone


# =====================================
# USER
# =====================================

class User(models.Model):

    ROLE_CHOICES = (
        ('institution', 'Institution'),
        ('admin', 'Admin'),
        ('registry_officer', 'Registry Officer'),
        ('zonal_manager', 'Zonal Manager'),
        ('inspector', 'Inspector'),
    )

    first_name = models.CharField(
        max_length=100
    )

    last_name = models.CharField(
        max_length=100
    )

    username = models.CharField(
        max_length=100,
        unique=True
    )

    email = models.EmailField(
        unique=True
    )

    phone = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    password = models.CharField(
        max_length=255
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default='institution'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


# =====================================
# INSTITUTION
# =====================================

class Institution(models.Model):

    INSTITUTION_TYPE_CHOICES = (
        ('technical', 'Technical School'),
        ('vocational', 'Vocational Training Centre'),
        ('institute', 'Technical Institute'),
        ('university', 'Technical University'),
        ('other', 'Other'),
    )

    FACILITY_STATUS_CHOICES = (
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('under_development', 'Under Development'),
    )

    ACCREDITATION_STATUS_CHOICES = (
        ('seeking', 'Seeking Accreditation'),
        ('accredited', 'Fully Accredited'),
        ('provisional', 'Provisionally Accredited'),
        ('renewal', 'Accreditation Renewal'),
    )

    PREVIOUS_ACCREDITATION_CHOICES = (
        ('none', 'Never Accredited'),
        ('approved', 'Previously Approved'),
        ('accredited', 'Previously Accredited'),
        ('revoked', 'Accreditation Revoked'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    # Basic Information
    institution_name = models.CharField(
        max_length=255
    )

    institution_type = models.CharField(
        max_length=50,
        choices=INSTITUTION_TYPE_CHOICES,
        null=True,
        blank=True
    )

    registration_number = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    certificate_number = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # Ownership & Management
    institution_owner = models.CharField(
        max_length=255
    )

    owner_title = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    principal_name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    principal_email = models.EmailField(
        null=True,
        blank=True
    )

    principal_phone = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    # Location
    street_address = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    # Kept for backward compatibility but can be left empty when linked location IDs are set.
    location = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    region = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    city = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    district = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    ward = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    street = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    # Programs & Statistics
    programs_offered = models.TextField(
        null=True,
        blank=True
    )

    total_students = models.IntegerField(
        null=True,
        blank=True
    )

    total_staff = models.IntegerField(
        null=True,
        blank=True
    )

    # Facilities
    facility_status = models.CharField(
        max_length=50,
        choices=FACILITY_STATUS_CHOICES,
        null=True,
        blank=True
    )

    has_library = models.BooleanField(
        default=False
    )

    has_laboratory = models.BooleanField(
        default=False
    )

    has_workshop = models.BooleanField(
        default=False
    )

    # Accreditation Information
    accreditation_status = models.CharField(
        max_length=50,
        choices=ACCREDITATION_STATUS_CHOICES,
        null=True,
        blank=True
    )

    previous_accreditation = models.CharField(
        max_length=50,
        choices=PREVIOUS_ACCREDITATION_CHOICES,
        null=True,
        blank=True
    )

    years_operation = models.IntegerField(
        null=True,
        blank=True
    )

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = 'institutions'

    def __str__(self):
        return self.institution_name


# =====================================
# APPLICATION
# =====================================

class Application(models.Model):

    APPLICATION_TYPES = (
        ('registration', 'Registration'),
        ('accreditation', 'Accreditation'),
        ('renewal', 'Renewal'),
    )

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('inspection', 'Inspection'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('conditional', 'Conditional'),
    )

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    reference_number = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True
    )

    application_type = models.CharField(
        max_length=50,
        choices=APPLICATION_TYPES
    )

    category = models.CharField(
        max_length=100
    )

    programs_requested = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    application_description = models.TextField(
        null=True,
        blank=True
    )

    expected_students = models.IntegerField(
        null=True,
        blank=True
    )

    preferred_inspection_date = models.DateField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='draft'
    )

    payment_status = models.CharField(
        max_length=50,
        default='pending'
    )

    review_status = models.CharField(
        max_length=50,
        default='pending'
    )

    inspection_status = models.CharField(
        max_length=50,
        default='pending'
    )

    submission_date = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'applications'

    def __str__(self):
        return self.reference_number or str(self.id)


# =====================================
# DOCUMENT
# =====================================

class Document(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE
    )

    document_name = models.CharField(
        max_length=255
    )

    document_type = models.CharField(
        max_length=100
    )

    file = models.FileField(
        upload_to='documents/'
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='pending'
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'documents'

    def __str__(self):
        return self.document_name


# =====================================
# PAYMENT
# =====================================

class Payment(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    control_number = models.CharField(
        max_length=100,
        unique=True
    )

    payment_method = models.CharField(
        max_length=100
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='pending'
    )

    receipt_number = models.CharField(
        max_length=150,
        null=True,
        blank=True
    )

    transaction_reference = models.CharField(
        max_length=150,
        null=True,
        blank=True
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return self.control_number

    @classmethod
    def generate_unique_control_number(cls):
        while True:
            control_number = f"CTRL-{random.randint(100000, 999999)}"
            if not cls.objects.filter(control_number=control_number).exists():
                return control_number

    def mark_paid(self):
        self.status = 'paid'
        if not self.paid_at:
            self.paid_at = timezone.now()
        if not self.receipt_number:
            self.receipt_number = f"RCPT-{random.randint(100000, 999999)}"
        if not self.transaction_reference:
            self.transaction_reference = f"TRX-{random.randint(10000000, 99999999)}"
        self.save()

    @property
    def is_expired(self):
        return self.status == 'pending' and self.expires_at and timezone.now() > self.expires_at


class PaymentAuditLog(models.Model):
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    action = models.CharField(
        max_length=120
    )
    details = models.TextField(
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'payment_audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} - {self.payment.control_number}"


# =====================================
# REVIEW
# =====================================

class Review(models.Model):

    DECISION_CHOICES = (
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('conditional', 'Conditional'),
        ('pending', 'Pending'),
    )

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE
    )

    officer = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    decision = models.CharField(
        max_length=50,
        choices=DECISION_CHOICES,
        default='pending'
    )

    comments = models.TextField(
        null=True,
        blank=True
    )

    review_date = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'reviews'

    def __str__(self):
        return self.decision


# =====================================
# INSPECTION TEAM
# =====================================

class InspectionTeam(models.Model):

    inspection_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'inspection_teams'

    def __str__(self):
        return f"Team {self.id}"


# =====================================
# TEAM MEMBER
# =====================================

class TeamMember(models.Model):

    team = models.ForeignKey(
        InspectionTeam,
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'team_members'

    def __str__(self):
        return self.user.username


# =====================================
# INSPECTION
# =====================================

class Inspection(models.Model):

    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    )

    RESULT_CHOICES = (
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('conditional', 'Conditional'),
    )

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE
    )

    team = models.ForeignKey(
        InspectionTeam,
        on_delete=models.CASCADE
    )

    scheduled_date = models.DateField()

    inspection_status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='scheduled'
    )

    inspection_result = models.CharField(
        max_length=50,
        choices=RESULT_CHOICES,
        null=True,
        blank=True
    )

    overall_remarks = models.TextField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'inspections'

    def __str__(self):
        return f"Inspection {self.id}"


# =====================================
# INSPECTION FORM
# =====================================

class InspectionForm(models.Model):

    form_name = models.CharField(
        max_length=255
    )

    version = models.CharField(
        max_length=50
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'inspection_forms'

    def __str__(self):
        return self.form_name


# =====================================
# FORM QUESTION
# =====================================

class FormQuestion(models.Model):

    form = models.ForeignKey(
        InspectionForm,
        on_delete=models.CASCADE
    )

    question_text = models.TextField()

    expected_answer = models.TextField()

    class Meta:
        db_table = 'form_questions'

    def __str__(self):
        return self.question_text


# =====================================
# INSPECTION RESPONSE
# =====================================

class InspectionResponse(models.Model):

    inspection = models.ForeignKey(
        Inspection,
        on_delete=models.CASCADE
    )

    question = models.ForeignKey(
        FormQuestion,
        on_delete=models.CASCADE
    )

    actual_answer = models.TextField()

    comments = models.TextField(
        null=True,
        blank=True
    )

    score = models.IntegerField()

    class Meta:
        db_table = 'inspection_responses'

    def __str__(self):
        return str(self.score)


# =====================================
# CERTIFICATE
# =====================================

class Certificate(models.Model):

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('revoked', 'Revoked'),
    )

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE
    )

    certificate_number = models.CharField(
        max_length=100,
        unique=True
    )

    serial_number = models.CharField(
        max_length=100,
        unique=True
    )

    provision_act = models.CharField(
        max_length=100
    )

    issue_date = models.DateField()

    expiry_date = models.DateField(
        null=True,
        blank=True
    )

    executive_secretary_sign = models.CharField(
        max_length=255
    )

    chairman_sign = models.CharField(
        max_length=255
    )

    qr_code_path = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='active'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'certificates'

    def __str__(self):
        return self.certificate_number