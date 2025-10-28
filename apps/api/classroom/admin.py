from django.contrib import admin
from .models import Aluno, Treinamento, Turma, Matricula, Recurso


@admin.register(Aluno)
class AlunoAdmin(admin.ModelAdmin):
    list_display = ["nome", "email", "telefone"]
    search_fields = ["nome", "email"]
    list_filter = ["matriculas__turma"]


@admin.register(Treinamento)
class TreinamentoAdmin(admin.ModelAdmin):
    list_display = ["nome", "descricao"]
    search_fields = ["nome"]


@admin.register(Turma)
class TurmaAdmin(admin.ModelAdmin):
    list_display = ["nome", "treinamento", "data_inicio", "data_conclusao"]
    search_fields = ["nome", "treinamento__nome"]
    list_filter = ["treinamento", "data_inicio"]
    date_hierarchy = "data_inicio"


@admin.register(Matricula)
class MatriculaAdmin(admin.ModelAdmin):
    list_display = ["aluno", "turma", "data_matricula"]
    search_fields = ["aluno__nome", "turma__nome"]
    list_filter = ["turma", "data_matricula"]
    date_hierarchy = "data_matricula"


@admin.register(Recurso)
class RecursoAdmin(admin.ModelAdmin):
    list_display = ["nome", "tipo", "turma", "draft", "acesso_previo", "criado_em"]
    search_fields = ["nome", "turma__nome"]
    list_filter = ["tipo", "draft", "acesso_previo", "turma"]
    date_hierarchy = "criado_em"
