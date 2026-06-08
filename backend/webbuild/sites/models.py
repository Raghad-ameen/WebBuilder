from django.db import models
from django.contrib.auth.models import User


def get_default_content():
    return [
        {
            "id": "1",
            "type": "HeroSection",
            "data": {"title": "Title", "subtitle": "A brief description", "buttonText": "Start now"}
        }
    ]

class Website(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='websites')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content_json = models.JSONField(default=get_default_content)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    content = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return self.name
    
    
    
class UserSite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    data = models.JSONField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
    
    
class FormSubmission(models.Model):
    section_id = models.CharField(max_length=255)
    submission_data = models.JSONField() 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission for Section {self.section_id} at {self.created_at}"