from rest_framework import viewsets

from ..models import Matricula
from ..serializers import MatriculaSerializer
from ..permissions import IsOwnerOrAdmin


class MatriculaViewSet(viewsets.ModelViewSet):
    queryset = Matricula.objects.select_related(
        "aluno", "aluno__user", "turma", "turma__treinamento"
    ).all()
    serializer_class = MatriculaSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.request.user.is_staff:
            return queryset

        try:
            aluno = self.request.user.alunos
            return queryset.filter(aluno=aluno)
        except Exception:
            return queryset.none()
