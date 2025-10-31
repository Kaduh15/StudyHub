# Documentação do Banco de Dados - StudyHub

## Índice
1. [Visão Geral](#visão-geral)
2. [Diagrama de Entidades](#diagrama-de-entidades)
3. [Tabelas](#tabelas)
4. [Relacionamentos](#relacionamentos)
5. [Constraints e Índices](#constraints-e-índices)
6. [Migrações](#migrações)
7. [Seeds e Dados Iniciais](#seeds-e-dados-iniciais)

---

## Visão Geral

O banco de dados do StudyHub utiliza **SQLite3** para desenvolvimento e suporta migrações para outros bancos relacionais (PostgreSQL, MySQL) para produção.

### Informações Técnicas
- **Engine:** SQLite3 (desenvolvimento)
- **ORM:** Django ORM
- **Localização:** `apps/api/db.sqlite3`
- **Encoding:** UTF-8
- **Timezone:** America/Sao_Paulo

---

## Diagrama de Entidades

```
┌──────────────────┐
│   auth_user      │ (Django)
│──────────────────│
│ id (PK)          │
│ username         │
│ password         │
│ email            │
│ is_staff         │
└────────┬─────────┘
         │ 1:1
         │
┌────────▼─────────┐         ┌──────────────────┐
│  classroom_aluno │         │classroom_        │
│──────────────────│         │  treinamento     │
│ id (PK)          │         │──────────────────│
│ user_id (FK)     │         │ id (PK)          │
│ nome             │         │ nome             │
│ email (UNIQUE)   │         │ descricao        │
│ telefone         │         └────────┬─────────┘
└────────┬─────────┘                  │ 1:N
         │                            │
         │ 1:N                ┌───────▼──────────┐
         │                    │ classroom_turma  │
         │                    │──────────────────│
         │                    │ id (PK)          │
         │            ┌───────┤ treinamento_id   │
         │            │       │ nome             │
         │            │       │ data_inicio      │
         │            │       │ data_conclusao   │
         │            │       │ link_acesso      │
         │            │       └────────┬─────────┘
         │            │                │ 1:N
         │            │                │
┌────────▼────────────▼─┐      ┌──────▼──────────┐
│classroom_matricula    │      │classroom_recurso│
│───────────────────────│      │─────────────────│
│ id (PK)               │      │ id (PK)         │
│ aluno_id (FK)         │      │ turma_id (FK)   │
│ turma_id (FK)         │      │ tipo            │
│ data_matricula        │      │ nome            │
│                       │      │ descricao       │
│ UNIQUE(aluno, turma)  │      │ acesso_previo   │
└───────────────────────┘      │ draft           │
                               │ criado_em       │
                               │ atualizado_em   │
                               └─────────────────┘
```

---

## Tabelas

### 1. auth_user (Django Built-in)

Tabela padrão do Django para autenticação de usuários.

**Nome:** `auth_user`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | INTEGER | PK, AUTO_INCREMENT | ID único do usuário |
| username | VARCHAR(150) | UNIQUE, NOT NULL | Nome de usuário para login |
| password | VARCHAR(128) | NOT NULL | Hash da senha |
| email | VARCHAR(254) | NOT NULL | Email do usuário |
| first_name | VARCHAR(150) | | Primeiro nome |
| last_name | VARCHAR(150) | | Sobrenome |
| is_staff | BOOLEAN | DEFAULT FALSE | Indica se é administrador |
| is_active | BOOLEAN | DEFAULT TRUE | Conta ativa |
| is_superuser | BOOLEAN | DEFAULT FALSE | Superusuário |
| date_joined | DATETIME | NOT NULL | Data de criação |
| last_login | DATETIME | NULL | Último login |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `username`

---

### 2. classroom_aluno

Representa os alunos cadastrados no sistema.

**Nome:** `classroom_aluno`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | INTEGER | PK, AUTO_INCREMENT | ID único do aluno |
| user_id | INTEGER | FK, UNIQUE, NOT NULL | Referência para auth_user |
| nome | VARCHAR(100) | NOT NULL | Nome completo do aluno |
| email | VARCHAR(254) | UNIQUE, NOT NULL | Email do aluno |
| telefone | VARCHAR(15) | NULL | Telefone (opcional) |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `email`
- UNIQUE: `user_id`
- INDEX: `user_id` (para otimizar joins)

**Foreign Keys:**
- `user_id` → `auth_user.id` (ON DELETE CASCADE)

**Meta:**
- `verbose_name`: "Aluno"
- `verbose_name_plural`: "Alunos"
- `ordering`: `["nome"]`

---

### 3. classroom_treinamento

Representa os cursos/treinamentos oferecidos.

**Nome:** `classroom_treinamento`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | INTEGER | PK, AUTO_INCREMENT | ID único do treinamento |
| nome | VARCHAR(100) | NOT NULL | Nome do treinamento |
| descricao | TEXT | NULL | Descrição detalhada (opcional) |

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `nome` (para buscas)

**Meta:**
- `verbose_name`: "Treinamento"
- `verbose_name_plural`: "Treinamentos"
- `ordering`: `["nome"]`

---

### 4. classroom_turma

Representa turmas específicas de treinamentos.

**Nome:** `classroom_turma`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | INTEGER | PK, AUTO_INCREMENT | ID único da turma |
| treinamento_id | INTEGER | FK, NOT NULL | Referência para treinamento |
| nome | VARCHAR(100) | NOT NULL | Nome/identificação da turma |
| data_inicio | DATE | NOT NULL | Data de início da turma |
| data_conclusao | DATE | NULL | Data de conclusão (opcional) |
| link_acesso | VARCHAR(200) | NULL | URL de acesso (opcional) |

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `treinamento_id`
- INDEX: `data_inicio` (para ordenação e filtros)

**Foreign Keys:**
- `treinamento_id` → `classroom_treinamento.id` (ON DELETE CASCADE)

**Meta:**
- `verbose_name`: "Turma"
- `verbose_name_plural`: "Turmas"
- `ordering`: `["-data_inicio"]` (mais recentes primeiro)

---

### 5. classroom_matricula

Representa a matrícula de alunos em turmas (tabela de relacionamento N:N).

**Nome:** `classroom_matricula`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | INTEGER | PK, AUTO_INCREMENT | ID único da matrícula |
| aluno_id | INTEGER | FK, NOT NULL | Referência para aluno |
| turma_id | INTEGER | FK, NOT NULL | Referência para turma |
| data_matricula | DATETIME | NOT NULL, AUTO_NOW_ADD | Data/hora da matrícula |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `(aluno_id, turma_id)` (composite unique constraint)
- INDEX: `aluno_id`
- INDEX: `turma_id`
- INDEX: `data_matricula`

**Foreign Keys:**
- `aluno_id` → `classroom_aluno.id` (ON DELETE CASCADE)
- `turma_id` → `classroom_turma.id` (ON DELETE CASCADE)

**Constraints:**
- UNIQUE TOGETHER: `["aluno_id", "turma_id"]` - Impede matrícula duplicada

**Meta:**
- `verbose_name`: "Matrícula"
- `verbose_name_plural`: "Matrículas"
- `ordering`: `["-data_matricula"]` (mais recentes primeiro)

---

### 6. classroom_recurso

Representa recursos educacionais (PDFs, vídeos, arquivos) de turmas.

**Nome:** `classroom_recurso`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | INTEGER | PK, AUTO_INCREMENT | ID único do recurso |
| turma_id | INTEGER | FK, NOT NULL | Referência para turma |
| tipo | VARCHAR(10) | NOT NULL, CHECK | Tipo do recurso (PDF/VIDEO/ZIP) |
| nome | VARCHAR(100) | NOT NULL | Nome/título do recurso |
| descricao | TEXT | NULL | Descrição detalhada (opcional) |
| acesso_previo | BOOLEAN | DEFAULT FALSE | Permite acesso antes da data_inicio |
| draft | BOOLEAN | DEFAULT FALSE | Recurso em rascunho (não visível) |
| criado_em | DATETIME | NOT NULL, AUTO_NOW_ADD | Data/hora de criação |
| atualizado_em | DATETIME | NOT NULL, AUTO_NOW | Data/hora da última atualização |

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `turma_id`
- INDEX: `criado_em` (para ordenação)
- INDEX: `draft` (para filtros de visibilidade)
- INDEX: `(turma_id, draft)` (composite para queries de alunos)

**Foreign Keys:**
- `turma_id` → `classroom_turma.id` (ON DELETE CASCADE)

**Check Constraints:**
- `tipo` IN ('PDF', 'VIDEO', 'ZIP')

**Meta:**
- `verbose_name`: "Recurso"
- `verbose_name_plural`: "Recursos"
- `ordering`: `["-criado_em"]` (mais recentes primeiro)

---

## Relacionamentos

### Diagrama de Cardinalidade

```
auth_user (1) ──────────── (1) classroom_aluno
                               │
                               │
                               │ (N)
                               │
classroom_treinamento (1) ─────┤
    │                          │
    │ (N)                      │
    │                          │
    └──── classroom_turma (1) ─┤
              │                │
              │ (N)            │
              │                │
              ├──── classroom_recurso
              │
              │ (N)
              │
              └──── classroom_matricula (N) ──── (N) classroom_aluno
```

### Descrição dos Relacionamentos

#### 1. User ↔ Aluno (1:1)
- **Tipo:** OneToOne
- **Direção:** `auth_user.id` ← `classroom_aluno.user_id`
- **On Delete:** CASCADE
- **Related Name:** `alunos` (acesso: `user.alunos`)
- **Descrição:** Cada usuário pode ter apenas um perfil de aluno

#### 2. Treinamento ↔ Turma (1:N)
- **Tipo:** ForeignKey
- **Direção:** `classroom_treinamento.id` ← `classroom_turma.treinamento_id`
- **On Delete:** CASCADE
- **Related Name:** `turmas` (acesso: `treinamento.turmas.all()`)
- **Descrição:** Um treinamento pode ter várias turmas

#### 3. Turma ↔ Recurso (1:N)
- **Tipo:** ForeignKey
- **Direção:** `classroom_turma.id` ← `classroom_recurso.turma_id`
- **On Delete:** CASCADE
- **Related Name:** `recursos` (acesso: `turma.recursos.all()`)
- **Descrição:** Uma turma pode ter vários recursos

#### 4. Aluno ↔ Turma (N:N através de Matricula)
- **Tipo:** ManyToMany (com modelo intermediário)
- **Tabela Intermediária:** `classroom_matricula`
- **FKs:**
  - `classroom_aluno.id` ← `classroom_matricula.aluno_id`
  - `classroom_turma.id` ← `classroom_matricula.turma_id`
- **On Delete:** CASCADE em ambas FKs
- **Related Names:**
  - `aluno.matriculas.all()` - todas as matrículas do aluno
  - `turma.matriculas.all()` - todas as matrículas da turma
- **Descrição:** Alunos podem se matricular em várias turmas, e turmas podem ter vários alunos

---

## Constraints e Índices

### Unique Constraints

| Tabela | Campos | Descrição |
|--------|--------|-----------|
| auth_user | username | Garante unicidade do username |
| classroom_aluno | email | Garante unicidade do email do aluno |
| classroom_aluno | user_id | Garante 1:1 com auth_user |
| classroom_matricula | (aluno_id, turma_id) | Impede matrícula duplicada |

### Check Constraints

| Tabela | Campo | Constraint | Descrição |
|--------|-------|------------|-----------|
| classroom_recurso | tipo | IN ('PDF', 'VIDEO', 'ZIP') | Valida tipos de recurso |

### Foreign Key Constraints

Todas as Foreign Keys têm `ON DELETE CASCADE`:
- Deletar User → deleta Aluno relacionado
- Deletar Treinamento → deleta todas Turmas relacionadas
- Deletar Turma → deleta todas Matrículas e Recursos relacionados
- Deletar Aluno → deleta todas Matrículas relacionadas

### Índices de Performance

#### Índices Automáticos (Django)
- Primary Keys: sempre indexadas
- Foreign Keys: sempre indexadas
- Unique Fields: sempre indexadas

#### Índices Recomendados para Produção

```sql
-- Para queries de alunos buscando turmas matriculadas
CREATE INDEX idx_matricula_aluno_turma 
ON classroom_matricula(aluno_id, turma_id);

-- Para queries de recursos visíveis de uma turma
CREATE INDEX idx_recurso_turma_draft 
ON classroom_recurso(turma_id, draft);

-- Para ordenação de turmas por data
CREATE INDEX idx_turma_data_inicio 
ON classroom_turma(data_inicio DESC);

-- Para busca de treinamentos por nome
CREATE INDEX idx_treinamento_nome 
ON classroom_treinamento(nome);

-- Para busca de alunos por nome
CREATE INDEX idx_aluno_nome 
ON classroom_aluno(nome);
```

---

## Migrações

### Histórico de Migrações

#### 0001_initial
**Descrição:** Criação inicial de todos os modelos

**Data:** Primeira versão do projeto

**Operações:**
- Criação da tabela `classroom_treinamento`
- Criação da tabela `classroom_aluno`
- Criação da tabela `classroom_turma`
- Criação da tabela `classroom_matricula`
- Criação da tabela `classroom_recurso`
- Definição de todas as Foreign Keys
- Definição de unique constraints

#### 0002_rename_trinamento_treinamento_alter_recurso_tipo
**Descrição:** Correção de typo no nome do modelo e ajuste nos tipos de recurso

**Operações:**
- Renomeia modelo `Trinamento` → `Treinamento`
- Ajusta choices do campo `tipo` em `Recurso`

#### 0003_alter_aluno_options_alter_matricula_options_and_more
**Descrição:** Ajustes de metadados e ordenação

**Operações:**
- Adiciona `verbose_name` e `verbose_name_plural` para todos os modelos
- Define ordenação padrão para cada modelo
- Ajusta labels de campos

### Comandos de Migração

```bash
# Criar novas migrações após mudanças nos models
python manage.py makemigrations

# Aplicar migrações pendentes
python manage.py migrate

# Ver SQL gerado por uma migração (sem aplicar)
python manage.py sqlmigrate classroom 0001

# Reverter migração
python manage.py migrate classroom 0002  # volta para migração 0002

# Ver status das migrações
python manage.py showmigrations

# Limpar banco e recriar tudo (CUIDADO!)
python manage.py flush
python manage.py migrate
```

---

## Seeds e Dados Iniciais

### Criar Superusuário

```bash
python manage.py createsuperuser
# Username: admin
# Email: admin@studyhub.com
# Password: ********
```

### Script de Seed (Exemplo)

Criar arquivo `classroom/management/commands/seed.py`:

```python
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from classroom.models import Aluno, Treinamento, Turma, Matricula, Recurso
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        # Limpar dados existentes
        Recurso.objects.all().delete()
        Matricula.objects.all().delete()
        Turma.objects.all().delete()
        Treinamento.objects.all().delete()
        Aluno.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        # Criar admin
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@studyhub.com',
            password='admin123'
        )

        # Criar alunos
        for i in range(1, 6):
            user = User.objects.create_user(
                username=f'aluno{i}',
                email=f'aluno{i}@example.com',
                password='senha123'
            )
            Aluno.objects.create(
                user=user,
                nome=f'Aluno {i}',
                email=f'aluno{i}@example.com',
                telefone=f'1199999999{i}'
            )

        # Criar treinamentos
        python = Treinamento.objects.create(
            nome='Python Básico',
            descricao='Introdução à linguagem Python'
        )
        django = Treinamento.objects.create(
            nome='Django Avançado',
            descricao='Desenvolvimento web com Django'
        )

        # Criar turmas
        hoje = date.today()
        turma1 = Turma.objects.create(
            treinamento=python,
            nome='Turma 2024-01',
            data_inicio=hoje - timedelta(days=30),
            data_conclusao=hoje + timedelta(days=30),
            link_acesso='https://meet.google.com/python-2024-01'
        )
        turma2 = Turma.objects.create(
            treinamento=django,
            nome='Turma 2024-02',
            data_inicio=hoje + timedelta(days=7),
            data_conclusao=hoje + timedelta(days=60),
            link_acesso='https://meet.google.com/django-2024-02'
        )

        # Matricular alunos
        alunos = Aluno.objects.all()
        for aluno in alunos[:3]:
            Matricula.objects.create(aluno=aluno, turma=turma1)
        for aluno in alunos[2:]:
            Matricula.objects.create(aluno=aluno, turma=turma2)

        # Criar recursos
        Recurso.objects.create(
            turma=turma1,
            tipo='PDF',
            nome='Apostila Python - Módulo 1',
            descricao='Introdução e sintaxe básica',
            acesso_previo=False,
            draft=False
        )
        Recurso.objects.create(
            turma=turma1,
            tipo='VIDEO',
            nome='Aula 1 - Instalação',
            descricao='Como instalar Python',
            acesso_previo=True,
            draft=False
        )
        Recurso.objects.create(
            turma=turma2,
            tipo='PDF',
            nome='Django REST Framework',
            descricao='Criando APIs',
            acesso_previo=True,
            draft=False
        )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
```

**Executar:**
```bash
python manage.py seed
```

---

## Backup e Restauração

### Backup SQLite

```bash
# Backup do banco completo
cp apps/api/db.sqlite3 apps/api/db.sqlite3.backup

# Backup com timestamp
cp apps/api/db.sqlite3 "apps/api/db.sqlite3.$(date +%Y%m%d_%H%M%S).backup"

# Export para SQL dump
sqlite3 apps/api/db.sqlite3 .dump > backup.sql
```

### Restauração

```bash
# Restaurar de backup
cp apps/api/db.sqlite3.backup apps/api/db.sqlite3

# Restaurar de SQL dump
sqlite3 apps/api/db.sqlite3 < backup.sql
```

### Dump de Dados (Django)

```bash
# Export de dados para JSON (fixtures)
python manage.py dumpdata > backup.json
python manage.py dumpdata classroom > classroom_backup.json

# Import de dados
python manage.py loaddata backup.json
```

---

## Queries SQL Úteis

### Consultas de Análise

```sql
-- Total de alunos por turma
SELECT 
    t.nome AS turma,
    tr.nome AS treinamento,
    COUNT(m.id) AS total_alunos
FROM classroom_turma t
JOIN classroom_treinamento tr ON t.treinamento_id = tr.id
LEFT JOIN classroom_matricula m ON m.turma_id = t.id
GROUP BY t.id
ORDER BY total_alunos DESC;

-- Recursos mais acessíveis (não-draft)
SELECT 
    r.nome,
    r.tipo,
    t.nome AS turma,
    r.acesso_previo,
    r.draft
FROM classroom_recurso r
JOIN classroom_turma t ON r.turma_id = t.id
WHERE r.draft = 0
ORDER BY r.criado_em DESC;

-- Alunos matriculados em múltiplas turmas
SELECT 
    a.nome,
    a.email,
    COUNT(m.id) AS total_turmas
FROM classroom_aluno a
JOIN classroom_matricula m ON m.aluno_id = a.id
GROUP BY a.id
HAVING COUNT(m.id) > 1
ORDER BY total_turmas DESC;

-- Turmas com data de início próxima
SELECT 
    t.nome,
    tr.nome AS treinamento,
    t.data_inicio,
    COUNT(m.id) AS alunos_matriculados
FROM classroom_turma t
JOIN classroom_treinamento tr ON t.treinamento_id = tr.id
LEFT JOIN classroom_matricula m ON m.turma_id = t.id
WHERE t.data_inicio >= DATE('now')
GROUP BY t.id
ORDER BY t.data_inicio ASC;

-- Recursos por tipo
SELECT 
    tipo,
    COUNT(*) AS quantidade,
    SUM(CASE WHEN draft = 0 THEN 1 ELSE 0 END) AS publicados,
    SUM(CASE WHEN draft = 1 THEN 1 ELSE 0 END) AS rascunhos
FROM classroom_recurso
GROUP BY tipo;
```

### Limpeza e Manutenção

```sql
-- Deletar matrículas órfãs (não deveria existir com CASCADE)
DELETE FROM classroom_matricula 
WHERE aluno_id NOT IN (SELECT id FROM classroom_aluno);

-- Deletar recursos draft antigos (>90 dias)
DELETE FROM classroom_recurso
WHERE draft = 1 
AND criado_em < DATE('now', '-90 days');

-- Verificar integridade referencial
PRAGMA foreign_key_check;

-- Reindexar banco (SQLite)
VACUUM;
REINDEX;
```

---

## Schema SQL Completo

```sql
-- Tabela: classroom_aluno
CREATE TABLE classroom_aluno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    telefone VARCHAR(15),
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
);

-- Tabela: classroom_treinamento
CREATE TABLE classroom_treinamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Tabela: classroom_turma
CREATE TABLE classroom_turma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treinamento_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    data_inicio DATE NOT NULL,
    data_conclusao DATE,
    link_acesso VARCHAR(200),
    FOREIGN KEY (treinamento_id) REFERENCES classroom_treinamento(id) ON DELETE CASCADE
);

-- Tabela: classroom_matricula
CREATE TABLE classroom_matricula (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    turma_id INTEGER NOT NULL,
    data_matricula DATETIME NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES classroom_aluno(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES classroom_turma(id) ON DELETE CASCADE,
    UNIQUE(aluno_id, turma_id)
);

-- Tabela: classroom_recurso
CREATE TABLE classroom_recurso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turma_id INTEGER NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK(tipo IN ('PDF', 'VIDEO', 'ZIP')),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    acesso_previo BOOLEAN DEFAULT 0,
    draft BOOLEAN DEFAULT 0,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES classroom_turma(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_aluno_user ON classroom_aluno(user_id);
CREATE INDEX idx_turma_treinamento ON classroom_turma(treinamento_id);
CREATE INDEX idx_turma_data ON classroom_turma(data_inicio);
CREATE INDEX idx_matricula_aluno ON classroom_matricula(aluno_id);
CREATE INDEX idx_matricula_turma ON classroom_matricula(turma_id);
CREATE INDEX idx_recurso_turma ON classroom_recurso(turma_id);
CREATE INDEX idx_recurso_draft ON classroom_recurso(draft);
```

---

## Migração para Produção

### PostgreSQL

Atualizar `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

### MySQL

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}
```

### Transferir Dados

```bash
# Exportar do SQLite
python manage.py dumpdata > data.json

# Configurar novo banco
# Atualizar settings.py com nova configuração

# Aplicar migrações no novo banco
python manage.py migrate

# Importar dados
python manage.py loaddata data.json
```

---

## Performance e Otimização

### Recomendações

1. **Usar select_related() e prefetch_related()** em queries com FKs
2. **Adicionar índices compostos** para queries frequentes
3. **Implementar paginação** para listas grandes
4. **Cache de queries** com Django Cache Framework
5. **Connection pooling** em produção (pgBouncer para PostgreSQL)
6. **Monitoramento** com Django Debug Toolbar em desenvolvimento

### Queries Otimizadas (já implementadas no código)

```python
# views/aluno.py
queryset = Aluno.objects.select_related("user").all()

# views/turma.py
queryset = (
    Turma.objects.select_related("treinamento")
    .prefetch_related("matriculas", "recursos")
    .all()
)

# views/matricula.py
queryset = Matricula.objects.select_related(
    "aluno", "aluno__user", "turma", "turma__treinamento"
).all()
```

---

**Última Atualização:** Outubro 2025
**Versão do Schema:** 1.0
**Django Version:** 5.2.7
