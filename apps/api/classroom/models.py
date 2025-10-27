from django.db import models


class Aluno(models.Model):
    user = models.OneToOneField(
        "auth.User", on_delete=models.CASCADE, related_name="aluno_perfil"
    )
    nome = models.CharField(max_length=100)
    idade = models.IntegerField()
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.nome
