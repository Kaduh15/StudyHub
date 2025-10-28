from django.db import models

from .treinamento import Treinamento


class Turma(models.Model):
    """
    Modelo que representa uma turma de um treinamento específico.
    """

    id = models.AutoField(primary_key=True)
    treinamento = models.ForeignKey(
        Treinamento,
        related_name="turmas",
        on_delete=models.CASCADE,
        verbose_name="Treinamento",
    )
    nome = models.CharField(max_length=100, verbose_name="Nome")
    data_inicio = models.DateField(verbose_name="Data de Início")
    data_conclusao = models.DateField(
        null=True, blank=True, verbose_name="Data de Conclusão"
    )
    link_acesso = models.URLField(null=True, blank=True, verbose_name="Link de Acesso")

    class Meta:
        verbose_name = "Turma"
        verbose_name_plural = "Turmas"
        ordering = ["-data_inicio"]

    def __str__(self):
        return f"{self.nome} - {self.treinamento.nome}"
