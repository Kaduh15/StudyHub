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
        return data


class AccessTokenOnlyView(TokenObtainPairView):
    serializer_class = AccessTokenOnlySerializer
