from django.contrib.auth.models import User
from rest_framework import serializers

from ..models import Aluno, Turma, Matricula


class AlunoSerializer(serializers.ModelSerializer):
    turma_id = serializers.IntegerField(write_only=True, required=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Aluno
        fields = ["id", "user_id", "nome", "email", "telefone", "turma_id"]
        read_only_fields = ["id", "user_id"]

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Já existe um usuário com este e-mail.")
        if Aluno.objects.filter(email=value).exists():
            raise serializers.ValidationError("Já existe um aluno com este e-mail.")
        return value

    def validate_turma_id(self, value):
        if not Turma.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Turma não encontrada.")
        return value

    def create(self, validated_data):
        turma_id = validated_data.pop("turma_id")
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

        turma = Turma.objects.get(pk=turma_id)
        Matricula.objects.create(aluno=aluno, turma=turma)

        return aluno

    @staticmethod
    def _gerar_senha_padrao(nome: str) -> str:
        prefixo = nome.strip().lower()[:3]
        return f"{prefixo}@134"
