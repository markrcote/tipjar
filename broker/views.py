from django import forms
from django.contrib.auth import logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils.translation import ugettext_lazy as _


class NewUserForm(UserCreationForm):
    username = forms.EmailField(label=_('Email address'))

    def save(self, commit=True):
        user = super(NewUserForm, self).save(commit=False)
        user.email = self.cleaned_data['username']
        if commit:
            user.save()
        return user


def index(request):
    if (request and hasattr(request, 'user') and
        request.user.is_authenticated()):
        return HttpResponseRedirect(reverse('user'))
    return HttpResponseRedirect(reverse('login'))


def user(request):
    if not (request and hasattr(request, 'user') and
            request.user.is_authenticated()):
        return HttpResponseRedirect('login')
    return render_to_response('broker/user.html',
                              { 'apiurl': {
                                  'mintchip': reverse('api_dispatch_list',
                                                      kwargs={'resource_name': 'mintchip',
                                                              'api_name': 'v1'}),
                                  # FIXME: Proper user URL
                                  'user': reverse('api_dispatch_list',
                                                  kwargs={'resource_name': 'user',
                                                          'api_name': 'v1'}) + str(request.user.id) + '/',
                                  'valuemessage': reverse('api_dispatch_list',
                                                          kwargs={ 'resource_name': 'valuemessage',
                                                                   'api_name': 'v1'
                                                                   }) } },
                              context_instance=RequestContext(request))

def new_user(request):
    if request.method == 'POST':
        form = NewUserForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('login'))
    else:
        form = NewUserForm() # An unbound form

    return render_to_response('broker/new_user.html', {
            'form': form,
            }, context_instance=RequestContext(request))
