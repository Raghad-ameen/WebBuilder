from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Website, UserSite
from .serializers import WebsiteSerializer, UserSerializer,UserSiteSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# 1. تخصيص البيانات التي يعيدها التوكن (الـ Serializer)
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # هنا نضيف البيانات التي سيقرأها React
        data['is_staff'] = self.user.is_staff
        data['username'] = self.user.username
        return data

# 2. تخصيص الـ View ليستخدم الـ Serializer الجديد
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class WebsiteViewSet(viewsets.ModelViewSet):
    serializer_class = WebsiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # جلب المواقع التابعة للمستخدم المسجل دخوله حالياً فقط
        return Website.objects.filter(owner=self.request.user)


    def create(self, request, *args, **kwargs):
        # طباعة البيانات في التيرمينال لنعرف ماذا يصل من ريـاكت
        print("Data received from React:", request.data)
        
        # التأكد من وجود مستخدم واحد على الأقل في قاعدة البيانات
        user = User.objects.first()
        if not user:
            # إذا لم يوجد مستخدم، أنشئ واحد تكرماً للتجربة
            user = User.objects.create_superuser('admin2', 'admin@test.com', 'pass123')

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("Serializer Errors:", serializer.errors) # سيظهر لك هنا لو الـ slug مكرر
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
@permission_classes([IsAdminUser]) # حماية المسار للأدمن فقط
def get_all_sites(request):
    sites = Website.objects.all() # 👈 تأكد من اسم الموديل هنا
    serializer = UserSiteSerializer(sites, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_site_status(request, site_id):
    try:
        # تأكد أن الموديل هو Website وليس UserSite إذا كانت البيانات هناك
        site = Website.objects.get(id=site_id) 
        site.is_active = not site.is_active
        site.save()
        return Response({'status': 'success', 'is_active': site.is_active})
    except Website.DoesNotExist:
        return Response({'error': 'Site not found'}, status=404)