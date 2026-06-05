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

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    institution_name = models.CharField(
        max_length=255
    )

    institution_owner = models.CharField(
        max_length=255
    )

    location = models.CharField(
        max_length=255
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