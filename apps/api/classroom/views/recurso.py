from rest_framework import viewsets

from ..models import Recurso
from ..serializers import RecursoSerializer
from ..permissions import IsEnrolledAndResourceAccessible


class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.select_related("turma", "turma__treinamento").all()
    serializer_class = RecursoSerializer
    permission_classes = [IsEnrolledAndResourceAccessible]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        if self.request.user.is_staff:
            return queryset

        try:
            aluno = self.request.user.alunos
            return queryset.filter(
                draft=False,
                turma__matriculas__aluno=aluno,
            ).distinct()
        except Exception:
            return queryset.none()
