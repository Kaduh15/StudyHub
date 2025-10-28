from rest_framework import serializers

from ..models import Recurso


class RecursoSerializer(serializers.ModelSerializer):
    turma_nome = serializers.CharField(source="turma.nome", read_only=True)
    tipo_display = serializers.CharField(source="get_tipo_display", read_only=True)

    class Meta:
        model = Recurso
        fields = [
            "id",
            "turma",
            "turma_nome",
            "tipo",
            "tipo_display",
            "nome",
            "descricao",
            "acesso_previo",
            "draft",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = [
            "id",
            "turma_nome",
            "tipo_display",
            "criado_em",
            "atualizado_em",
        ]
