from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Treinamento
from ..serializers import TreinamentoSerializer, TurmaSerializer
from ..permissions import IsAdminOrReadOnly


class TreinamentoViewSet(viewsets.ModelViewSet):
    queryset = Treinamento.objects.prefetch_related("turmas").all()
    serializer_class = TreinamentoSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=True, methods=["get"])
    def turmas(self, request, pk=None):
        treinamento = self.get_object()
        turmas = treinamento.turmas.all()
        serializer = TurmaSerializer(turmas, many=True)
        return Response(serializer.data)
