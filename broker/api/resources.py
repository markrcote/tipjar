from django.contrib.auth.models import User
from django.db import models
from tastypie.models import create_api_key
from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.authentication import Authentication, ApiKeyAuthentication
from tastypie.resources import ModelResource
from broker.models import ValueMessage, MintChip

models.signals.post_save.connect(create_api_key, sender=User)


class WebAuthentication(Authentication):
    def is_authenticated(self, request, **kwargs):
        if request.user.is_authenticated():
            return True
        return super(WebAuthentication, self).is_authenticated(request,
                                                               **kwargs)
    
    def get_identifier(self, request):
        if request.user.is_authenticated():
            return request.user.username
        else:
            return super(WebAuthentication, self).get_identifier(request)


class AllowPostAuthentication(WebAuthentication):
    def is_authenticated(self, request, **kwargs):
        if request and request.method == 'POST':
            return True
        return super(AllowPostAuthentication, self).is_authenticated(request,
                                                                     **kwargs)


class ChipIdAuthorization(Authorization):
    def apply_limits(self, request, object_list):
        if request and hasattr(request, 'user'):
            return object_list.filter(dest_mintchip__user__username=request.user.username)
        return object_list.none()


class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        authentication = WebAuthentication()
        authorization = Authorization()
        allowed_methods = ['get']

    def apply_authorization_limits(self, request, object_list):
        return object_list.filter(pk=request.user.pk)


class MintChipResource(ModelResource):
    user = fields.ToOneField(UserResource, 'user')
    class Meta:
        queryset = MintChip.objects.all()
        authentication = WebAuthentication()
        authorization = Authorization()
        allowed_methods = ['get', 'post', 'delete']
    
    def obj_create(self, bundle, request=None, **kwargs):
        return super(MintChipResource, self).obj_create(bundle, request,
                                                        user=request.user)
    
    def apply_authorization_limits(self, request, object_list):
        return object_list.filter(user=request.user)


class ValueMessageResource(ModelResource):
    class Meta:
        queryset = ValueMessage.objects.all().order_by('-added_when')
        authentication = AllowPostAuthentication()
        authorization = Authorization()
        allowed_methods = ['get', 'post', 'put']
    
    def apply_authorization_limits(self, request, object_list):
        user_mintchips = MintChip.objects.filter(user=request.user)
        for u in user_mintchips:
            object_list |= object_list.filter(dest_mintchip_id=u.mintchip_id)
        return object_list
