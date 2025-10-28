from django.db import models


class Treinamento(models.Model):
    """
    Modelo que representa um treinamento/curso oferecido.
    """

    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100, verbose_name="Nome")
    descricao = models.TextField(null=True, blank=True, verbose_name="Descrição")

    class Meta:
        verbose_name = "Treinamento"
        verbose_name_plural = "Treinamentos"
        ordering = ["nome"]

    def __str__(self):
        return self.nome
