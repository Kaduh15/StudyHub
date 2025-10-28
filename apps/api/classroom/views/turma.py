from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Turma
from ..serializers import TurmaSerializer, MatriculaSerializer, RecursoSerializer
from ..permissions import IsEnrolledStudentOrAdmin


class TurmaViewSet(viewsets.ModelViewSet):
    queryset = (
        Turma.objects.select_related("treinamento")
        .prefetch_related("matriculas", "recursos")
        .all()
    )
    serializer_class = TurmaSerializer
    permission_classes = [IsEnrolledStudentOrAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.request.user.is_staff:
            return queryset

        try:
            aluno = self.request.user.alunos
            return queryset.filter(matriculas__aluno=aluno).distinct()
        except Exception:
            return queryset.none()

    @action(detail=True, methods=["get"])
    def alunos(self, request, pk=None):
        turma = self.get_object()
        matriculas = turma.matriculas.select_related("aluno", "aluno__user").all()
        serializer = MatriculaSerializer(matriculas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def recursos(self, request, pk=None):
        turma = self.get_object()
        recursos = turma.recursos.all()
        serializer = RecursoSerializer(recursos, many=True)
        return Response(serializer.data)
