from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class AccessTokenOnlySerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.pop("refresh", None)

        data["is_staff"] = self.user.is_staff

        return data


class AccessTokenOnlyView(TokenObtainPairView):
    serializer_class = AccessTokenOnlySerializer


@api_view(["GET"])
def is_admin_view(request):
    is_admin = request.user.is_authenticated and request.user.is_staff
    return Response({"is_admin": is_admin})
