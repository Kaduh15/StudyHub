from rest_framework import serializers

from ..models import Treinamento


class TreinamentoSerializer(serializers.ModelSerializer):
    total_turmas = serializers.IntegerField(source="turmas.count", read_only=True)

    class Meta:
        model = Treinamento
        fields = ["id", "nome", "descricao", "total_turmas"]
        read_only_fields = ["id", "total_turmas"]
