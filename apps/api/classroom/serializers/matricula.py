from rest_framework import serializers

from ..models import Matricula


class MatriculaSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source="aluno.nome", read_only=True)
    turma_nome = serializers.CharField(source="turma.nome", read_only=True)

    class Meta:
        model = Matricula
        fields = [
            "id",
            "aluno",
            "aluno_nome",
            "turma",
            "turma_nome",
            "data_matricula",
        ]
        read_only_fields = ["id", "data_matricula", "aluno_nome", "turma_nome"]

    def validate(self, data):
        aluno = data.get("aluno")
        turma = data.get("turma")

        if (
            self.instance is None
            and Matricula.objects.filter(aluno=aluno, turma=turma).exists()
        ):
            raise serializers.ValidationError(
                "Este aluno já está matriculado nesta turma."
            )

        return data
