from rest_framework import serializers

from ..models import Turma


class TurmaSerializer(serializers.ModelSerializer):
    treinamento_nome = serializers.CharField(
        source="treinamento.nome", read_only=True
    )
    total_alunos = serializers.IntegerField(source="matriculas.count", read_only=True)

    class Meta:
        model = Turma
        fields = [
            "id",
            "treinamento",
            "treinamento_nome",
            "nome",
            "data_inicio",
            "data_conclusao",
            "link_acesso",
            "total_alunos",
        ]
        read_only_fields = ["id", "treinamento_nome", "total_alunos"]

    def validate(self, data):
        data_inicio = data.get("data_inicio")
        data_conclusao = data.get("data_conclusao")

        if data_inicio and data_conclusao and data_conclusao < data_inicio:
            raise serializers.ValidationError(
                {"data_conclusao": "A data de conclusão deve ser posterior à data de início."}
            )

        return data
