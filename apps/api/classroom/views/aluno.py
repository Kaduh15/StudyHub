from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Aluno
from ..serializers import AlunoSerializer
from ..permissions import IsOwnerOrAdmin


class AlunoViewSet(viewsets.ModelViewSet):
    queryset = Aluno.objects.select_related("user").all()
    serializer_class = AlunoSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.request.user.is_staff:
            return queryset

        try:
            return queryset.filter(user=self.request.user)
        except Exception:
            return queryset.none()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            {
                "detail": "Aluno criado com sucesso.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"])
    def matriculas(self, request, pk=None):
        aluno = self.get_object()
        from ..serializers import MatriculaSerializer

        matriculas = aluno.matriculas.select_related(
            "turma", "turma__treinamento"
        ).all()
        serializer = MatriculaSerializer(matriculas, many=True)
        return Response(serializer.data)
