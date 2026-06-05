from django.contrib import admin
from django.db.models import Sum

# Register your models here.
from .models import (
    User,
    Institution,
    Application,
    Inspection,
    Document,
    Payment,
    PaymentAuditLog,
    Review,
    InspectionTeam,
    Certificate,
    InspectionResponse,
    FormQuestion,
    InspectionForm,
    TeamMember,
)


class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'control_number',
        'application',
        'amount',
        'status',
        'payment_method',
        'expires_at',
        'paid_at',
        'created_at',
    )
    list_filter = (
        'status',
        'payment_method',
        'created_at',
        'expires_at',
    )
    search_fields = (
        'control_number',
        'application__reference_number',
        'application__institution__institution_name',
    )
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'paid_at')
    list_select_related = ('application', 'application__institution')

    def changelist_view(self, request, extra_context=None):
        qs = self.get_queryset(request)
        total_amount = qs.aggregate(total=Sum('amount'))['total'] or 0
        paid_amount = qs.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
        pending_count = qs.filter(status='pending').count()
        failed_count = qs.filter(status='failed').count()

        extra_context = extra_context or {}
        extra_context.update({
            'payment_dashboard_stats': {
                'total_payments': qs.count(),
                'total_amount': total_amount,
                'paid_amount': paid_amount,
                'pending_count': pending_count,
                'failed_count': failed_count,
            }
        })

        return super().changelist_view(request, extra_context=extra_context)


class PaymentAuditLogAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'payment',
        'action',
        'user',
        'created_at',
    )
    list_filter = ('action', 'created_at')
    search_fields = ('payment__control_number', 'action', 'details', 'user__username')
    date_hierarchy = 'created_at'


admin.site.register(User)
admin.site.register(Institution)
admin.site.register(Application)
admin.site.register(Inspection)
admin.site.register(Document)
admin.site.register(Payment, PaymentAdmin)
admin.site.register(PaymentAuditLog, PaymentAuditLogAdmin)
admin.site.register(Review)
admin.site.register(InspectionTeam)
admin.site.register(Certificate)
admin.site.register(InspectionResponse)
admin.site.register(FormQuestion)
admin.site.register(InspectionForm)
admin.site.register(TeamMember)
