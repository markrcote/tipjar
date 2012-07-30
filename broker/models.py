from django.db import models
from django.contrib.auth.models import User

MAX_AMOUNT_DIGITS = 10

class MintChip(models.Model):
    user = models.ForeignKey(User)
    mintchip_id = models.CharField(max_length=50)
    

class ValueMessage(models.Model):
    # we don't use a ForeignKey here because we don't want auth restrictions
    # to prevent anyone from *writing* a value message to any given mintchip.
    dest_mintchip_id = models.CharField(max_length=50)
    amount = models.IntegerField()  # in cents
    comment = models.TextField()
    value_msg = models.TextField()
    added_when = models.DateTimeField(auto_now_add=True)
    collected_when = models.DateTimeField(null=True)
