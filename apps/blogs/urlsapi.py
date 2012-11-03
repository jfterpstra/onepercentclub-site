from django.conf.urls import patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from surlex.dj import surl
from .views import BlogPostRoot, BlogPostInstance

urlpatterns = patterns('',
    url(r'^$', BlogPostRoot.as_view(), name='blogpost-root'),
    surl(r'^<slug:s>$', BlogPostInstance.as_view(), name='blogpost-instance'),
)

urlpatterns = format_suffix_patterns(urlpatterns)