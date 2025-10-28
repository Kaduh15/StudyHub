from django.db import models

from .aluno import Aluno
from .turma import Turma


class Matricula(models.Model):
    """
    Modelo que representa a matrícula de um aluno em uma turma.
    """

    id = models.AutoField(primary_key=True)
    aluno = models.ForeignKey(
        Aluno,
        related_name="matriculas",
        on_delete=models.CASCADE,
        verbose_name="Aluno",
    )
    turma = models.ForeignKey(
        Turma,
        related_name="matriculas",
        on_delete=models.CASCADE,
        verbose_name="Turma",
    )
    data_matricula = models.DateTimeField(
        auto_now_add=True, verbose_name="Data da Matrícula"
    )

    class Meta:
        verbose_name = "Matrícula"
        verbose_name_plural = "Matrículas"
        unique_together = [["aluno", "turma"]]
        ordering = ["-data_matricula"]

    def __str__(self):
        return f"{self.aluno.nome} - {self.turma.nome}"
