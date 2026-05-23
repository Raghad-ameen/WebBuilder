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
        section_id = request.data.get('section_id')
        submission_data = request.data.get('submission_data')
        
        if not section_id or not submission_data:
            return Response({"error": "Missing required data"}, status=status.HTTP_400_BAD_REQUEST)
        
        submission = FormSubmission.objects.create(
            section_id=section_id,
            submission_data=submission_data
        )
        
        return Response({
            "message": "Form submitted successfully", 
            "id": submission.id
        }, status=status.HTTP_201_CREATED)
        permission_classes = [AllowAny]
    def post(self, request):
        section_id = request.data.get('section_id')
        submission_data = request.data.get('submission_data')
        
        if not section_id or not submission_data:
            return Response({"error": "Missing required data"}, status=status.HTTP_400_BAD_REQUEST)
        
        submission = FormSubmission.objects.create(
            section_id=section_id,
            submission_data=submission_data
        )
        
        return Response({
            "message": "Form submitted successfully", 
            "id": submission.id
        }, status=status.HTTP_201_CREATED)