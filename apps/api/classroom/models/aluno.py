from django.db import models
from django.contrib.auth.models import User


class Aluno(models.Model):
    """
    Modelo que representa um aluno no sistema.
    """

    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="alunos",
        verbose_name="Usuário",
    )
    nome = models.CharField(max_length=100, verbose_name="Nome")
    email = models.EmailField(unique=True, verbose_name="E-mail")
    telefone = models.CharField(
        max_length=15, null=True, blank=True, verbose_name="Telefone"
    )

    class Meta:
        verbose_name = "Aluno"
        verbose_name_plural = "Alunos"
        ordering = ["nome"]

    def __str__(self):
        return self.nome
