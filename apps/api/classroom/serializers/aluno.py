from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from ..models import Aluno


class AlunoSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Aluno
        fields = ["id", "user_id", "nome", "email", "telefone"]
        read_only_fields = ["id", "user_id"]

    def validate_email(self, value):
        user_qs = User.objects.filter(username=value)

        aluno_qs = Aluno.objects.filter(email=value)

        if self.instance:
            user_qs = user_qs.exclude(pk=self.instance.user.pk)
            aluno_qs = aluno_qs.exclude(pk=self.instance.pk)

        if user_qs.exists() or aluno_qs.exists():
            raise serializers.ValidationError(
                "Já existe um usuário/aluno com este e-mail."
            )

        return value

    @transaction.atomic
    def create(self, validated_data):
        nome = validated_data["nome"]
        email = validated_data["email"]
        telefone = validated_data.get("telefone")

        senha_padrao = self._gerar_senha_padrao(nome)

        user = User.objects.create_user(
            username=email, email=email, first_name=nome, password=senha_padrao
        )

        aluno = Aluno.objects.create(
            user=user, nome=nome, email=email, telefone=telefone
        )

        return aluno

    def update(self, instance, validated_data):
        email = validated_data.get("email", instance.email)
        nome = validated_data.get("nome", instance.nome)

        if email != instance.email:
            instance.user.username = email
            instance.user.email = email
            instance.user.save()

        if nome != instance.nome:
            instance.user.first_name = nome
            instance.user.save()

        return super().update(instance, validated_data)

    @staticmethod
    def _gerar_senha_padrao(nome: str) -> str:
        prefixo = nome.strip().lower()[:3]
        return f"{prefixo}@123"
