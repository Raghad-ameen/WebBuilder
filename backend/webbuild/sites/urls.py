from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WebsiteViewSet,register_user,get_all_sites, toggle_site_status,FormSubmissionView

router = DefaultRouter()
router.register(r'websites', WebsiteViewSet, basename='site')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register'),
    path('admin/sites/', get_all_sites, name='admin_sites'),
    path('admin/sites/toggle/<int:site_id>/', toggle_site_status, name='toggle_status'),
    path('forms/submit/', FormSubmissionView.as_view(), name='form-submit'),
]