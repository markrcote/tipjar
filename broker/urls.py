from django.conf.urls.defaults import include, patterns, url
from tastypie.api import Api
from broker.api.resources import UserResource, ValueMessageResource, MintChipResource

v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(ValueMessageResource())
v1_api.register(MintChipResource())

urlpatterns = patterns('broker.views',
    url(r'^$', 'index', name='index'),
    url(r'^new_user/$', 'new_user', name='new_user'),
    url(r'^user/$', 'user', name='user'),
)

urlpatterns += patterns('',
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'broker/login.html'}, name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout_then_login', name='logout'),
    (r'^api/', include(v1_api.urls)),
)
