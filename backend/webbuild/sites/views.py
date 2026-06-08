import re
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Website, UserSite,FormSubmission
from .serializers import WebsiteSerializer, UserSerializer,UserSiteSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_staff'] = self.user.is_staff
        data['username'] = self.user.username
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class WebsiteViewSet(viewsets.ModelViewSet):
    serializer_class = WebsiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Website.objects.filter(owner=self.request.user)


    def create(self, request, *args, **kwargs):
        print("Data received from React:", request.data)
        
        user = User.objects.first()
        if not user:
            user = User.objects.create_superuser('admin2', 'admin@test.com', 'pass123')

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        site = self.get_object()
        
        if not site.is_active:
            return Response(
                {"error": "هذا الموقع معطل من قبل الإدارة. لا يمكنك تعديله."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().update(request, *args, **kwargs)
    
    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAdminUser])  
def get_all_sites(request):
    sites = Website.objects.all()
    serializer = UserSiteSerializer(sites, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_site_status(request, site_id):
    try:
        site = Website.objects.get(id=site_id) 
        site.is_active = not site.is_active
        site.save()
        return Response({'status': 'success', 'is_active': site.is_active})
    except Website.DoesNotExist:
        return Response({'error': 'Site not found'}, status=404)
    
    
    
class FormSubmissionView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  

    def post(self, request):
        print("REQUEST DATA:", request.data)
        section_id = request.data.get('section_id')
        is_popup = request.data.get('is_popup', False)
        submission_data = request.data.get('submission_data') 
        
        if not section_id or not submission_data:
            return Response({"error": "Missing required data"}, status=status.HTTP_400_BAD_REQUEST)
        
        if isinstance(submission_data, list):
            for field in submission_data:
                field_key = field.get('field_key', 'Unknown Field')
                value = str(field.get('value', '')).strip()
                data_type = field.get('data_type', 'Any')

                print(f"[فحص الباكيند] الحقل: {field_key} | القيمة: {value} | النوع المستهدف: {data_type}")

                if data_type == "Email" and value:
                    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
                    if not re.match(email_regex, value):
                        return Response(
                            {"error": f"الرجاء إدخال بريد إلكتروني صحيح في حقل '{field_key}'"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )

                elif data_type == "Phone" and value:
                    phone_regex = r"^\+?[0-9]{7,15}$"
                    if not re.match(phone_regex, value):
                        return Response(
                            {"error": f"الرجاء إدخال رقم هاتف صحيح في حقل '{field_key}'"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )

                elif data_type == "Number" and value:
                    if not value.replace('.', '', 1).isdigit():
                        return Response(
                            {"error": f"يجب أن يحتوي حقل '{field_key}' على أرقام فقط"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )

                elif data_type == "URL" and value:
                    url_regex = r"^https?://[^\s/$.?#].[^\s]*$"
                    if not re.match(url_regex, value):
                        return Response(
                            {"error": f"الرجاء إدخال رابط إلكتروني (URL) صحيح في حقل '{field_key}'"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )

                elif data_type == "Password" and value:
                    if len(value) < 6:
                        return Response(
                            {"error": f"كلمة المرور في حقل '{field_key}' قصيرة جداً، يجب ألا تقل عن 6 خانات"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )

        submission = FormSubmission.objects.create(
            section_id=section_id,
            submission_data=submission_data  
        )
        
        return Response({
            "message": "Form submitted and validated successfully", 
            "id": submission.id
        }, status=status.HTTP_201_CREATED)