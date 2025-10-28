from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AlunoViewSet,
    TreinamentoViewSet,
    TurmaViewSet,
    MatriculaViewSet,
    RecursoViewSet,
)

router = DefaultRouter()
router.register(r"alunos", AlunoViewSet, basename="aluno")
router.register(r"treinamentos", TreinamentoViewSet, basename="treinamento")
router.register(r"turmas", TurmaViewSet, basename="turma")
router.register(r"matriculas", MatriculaViewSet, basename="matricula")
router.register(r"recursos", RecursoViewSet, basename="recurso")

urlpatterns = [
    path("", include(router.urls)),
]
