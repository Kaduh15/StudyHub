from datetime import date
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """
    Permissão para administradores (staff).
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsAdminOrReadOnly(BasePermission):
    """
    Admin: CRUD completo
    Aluno autenticado: Somente leitura (GET, HEAD, OPTIONS)
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return request.method in SAFE_METHODS


class IsOwnerOrAdmin(BasePermission):
    """
    Admin: acesso a tudo
    Aluno: acesso somente aos próprios dados (somente leitura)
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if hasattr(obj, "user"):
            return obj.user == request.user
        elif hasattr(obj, "aluno"):
            return obj.aluno.user == request.user

        return False


class IsEnrolledStudentOrAdmin(BasePermission):
    """
    Para Turmas: admin vê tudo, aluno vê apenas turmas onde está matriculado
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if request.method not in SAFE_METHODS:
            return False

        try:
            aluno = request.user.alunos
            return obj.matriculas.filter(aluno=aluno).exists()
        except:
            return False


class IsEnrolledAndResourceAccessible(BasePermission):
    """
    Para Recursos: admin vê tudo, aluno vê apenas recursos das turmas matriculadas
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if request.method not in SAFE_METHODS:
            return False

        try:
            aluno = request.user.alunos
            matriculado = obj.turma.matriculas.filter(aluno=aluno).exists()
            if not matriculado:
                return False

            hoje = date.today()
            if hoje < obj.turma.data_inicio:
                return obj.acesso_previo
            else:
                return not obj.draft
        except:
            return False
