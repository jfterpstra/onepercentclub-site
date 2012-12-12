from apps.bluebottle_utils.serializers import SorlImageField
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import HyperlinkedIdentityField


class MemberDetailSerializer(serializers.ModelSerializer):

    url = HyperlinkedIdentityField(view_name='member-detail')
    picture = SorlImageField('userprofile.picture', '100x100', colorspace="GRAY", crop='center')

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'username', 'url', 'picture')


class MemberListSerializer(MemberDetailSerializer):

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'username', 'url')


class NoneHyperlinkedIdentityField(HyperlinkedIdentityField):
    """ Specialized version of HyperlinkedIdentityField that deals with None objects. """

    def field_to_native(self, obj, field_name):
        if obj is None:
            return ''
        else:
            super(NoneHyperlinkedIdentityField, self).field_to_native(obj, field_name)


class AuthenticatedMemberSerializer(MemberDetailSerializer):

    url = NoneHyperlinkedIdentityField(view_name='member-detail')

    class Meta(MemberDetailSerializer.Meta):
        pass