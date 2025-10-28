from django.db import models

from .turma import Turma


class Recurso(models.Model):
    """
    Modelo que representa um recurso educacional de uma turma.
    """

    class TipoRecurso(models.TextChoices):
        PDF = "PDF", "PDF"
        VIDEO = "VIDEO", "Vídeo"
        ZIP = "ZIP", "Arquivo ZIP"

    id = models.AutoField(primary_key=True)
    turma = models.ForeignKey(
        Turma,
        related_name="recursos",
        on_delete=models.CASCADE,
        verbose_name="Turma",
    )
    tipo = models.CharField(
        max_length=10, choices=TipoRecurso.choices, verbose_name="Tipo"
    )
    nome = models.CharField(max_length=100, verbose_name="Nome")
    descricao = models.TextField(null=True, blank=True, verbose_name="Descrição")
    acesso_previo = models.BooleanField(
        default=False,
        verbose_name="Acesso Prévio",
        help_text="Permite acesso antes da data de início da turma",
    )
    draft = models.BooleanField(
        default=False,
        verbose_name="Rascunho",
        help_text="Recurso em modo rascunho (não visível para alunos)",
    )
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Recurso"
        verbose_name_plural = "Recursos"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"
