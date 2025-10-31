# StudyHub API - Documentação

API REST para plataforma de gerenciamento de treinamentos e turmas.

## 📚 Documentação Completa

A documentação está dividida em três arquivos principais:

### 1. [Documentação da API](./API_DOCUMENTATION.md)
Documentação completa de todos os endpoints, modelos de dados, autenticação e exemplos de uso.

**Conteúdo:**
- Visão geral da API
- Autenticação JWT
- Endpoints detalhados (Alunos, Treinamentos, Turmas, Matrículas, Recursos)
- Modelos de dados
- Exemplos de requisições
- Códigos de resposta HTTP
- Troubleshooting

### 2. [Documentação do Banco de Dados](./DATABASE_DOCUMENTATION.md)
Estrutura completa do banco de dados, relacionamentos e queries úteis.

**Conteúdo:**
- Diagrama de entidades
- Tabelas e campos detalhados
- Relacionamentos e cardinalidade
- Constraints e índices
- Migrações
- Scripts de seed
- Backup e restauração
- Queries SQL úteis

### 3. [Documentação de Permissões](./PERMISSIONS_DOCUMENTATION.md)
Sistema completo de controle de acesso e autorização.

**Conteúdo:**
- Classes de permissões customizadas
- Aplicação por endpoint
- Fluxos de autorização
- Cenários de uso detalhados
- Matriz de permissões
- Testes de permissões

---

## 🚀 Quick Start

### Instalação

```bash
# Entrar no diretório da API
cd apps/api

# Criar ambiente virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Rodar servidor
python manage.py runserver
```

### Primeiro Acesso

```bash
# 1. Obter token de acesso
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"seu_usuario","password":"sua_senha"}'

# 2. Usar token nas requisições
curl -X GET http://localhost:8000/api/treinamentos/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📋 Resumo da API

### Endpoints Principais

| Endpoint | Descrição |
|----------|----------|
| `POST /api/auth/token` | Autenticação (obter JWT) |
| `GET /api/alunos/` | Listar alunos |
| `GET /api/treinamentos/` | Listar treinamentos |
| `GET /api/turmas/` | Listar turmas |
| `GET /api/matriculas/` | Listar matrículas |
| `GET /api/recursos/` | Listar recursos |

### Autenticação

Todos os endpoints (exceto `/api/auth/token`) requerem autenticação JWT:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Roles

- **Admin (staff):** Acesso total a todos os recursos
- **Aluno:** Acesso limitado aos seus próprios dados e turmas matriculadas

---

## 🗂️ Estrutura do Projeto

```
apps/api/
├── classroom/              # App principal
│   ├── models/            # Modelos (Aluno, Turma, Recurso, etc)
│   ├── views/             # ViewSets da API
│   ├── serializers/       # Serializers DRF
│   ├── permissions.py     # Classes de permissões customizadas
│   ├── urls.py           # Rotas do app
│   └── migrations/       # Migrações do banco
├── core/                  # Configurações do projeto
│   ├── settings.py       # Settings do Django
│   ├── urls.py          # URLs principais
│   └── views/           # Views auxiliares (auth)
├── manage.py             # CLI do Django
├── db.sqlite3           # Banco de dados SQLite
├── API_DOCUMENTATION.md  # Documentação da API
├── DATABASE_DOCUMENTATION.md  # Documentação do BD
└── PERMISSIONS_DOCUMENTATION.md  # Documentação de Permissões
```

---

## 🔑 Modelos Principais

### Aluno
Representa estudantes cadastrados no sistema.
- Relacionamento 1:1 com User (Django Auth)
- Campos: nome, email, telefone

### Treinamento
Cursos/treinamentos oferecidos.
- Campos: nome, descrição

### Turma
Turmas específicas de um treinamento.
- Relacionamento N:1 com Treinamento
- Campos: nome, data_inicio, data_conclusao, link_acesso

### Matrícula
Relacionamento N:N entre Aluno e Turma.
- Campos: aluno, turma, data_matricula
- Constraint: Única por (aluno, turma)

### Recurso
Materiais educacionais de uma turma.
- Relacionamento N:1 com Turma
- Tipos: PDF, VIDEO, ZIP
- Flags: draft, acesso_previo
- Controle temporal de liberação

---

## 🔐 Sistema de Permissões

### Resumo

| Permissão | Usado Em | Comportamento |
|-----------|----------|---------------|
| `IsAdmin` | Administrativo | Apenas staff |
| `IsAdminOrReadOnly` | Treinamentos | Admin: CRUD, Aluno: Leitura |
| `IsOwnerOrAdmin` | Alunos, Matrículas | Acesso apenas aos próprios dados |
| `IsEnrolledStudentOrAdmin` | Turmas | Acesso apenas a turmas matriculadas |
| `IsEnrolledAndResourceAccessible` | Recursos | Controle por matrícula + data + flags |

Veja [PERMISSIONS_DOCUMENTATION.md](./PERMISSIONS_DOCUMENTATION.md) para detalhes completos.

---

## 🧪 Testes

```bash
# Rodar todos os testes
python manage.py test

# Rodar testes específicos
python manage.py test classroom.tests.PermissionTests

# Com verbose
python manage.py test --verbosity=2
```

---

## 🛠️ Desenvolvimento

### Criar Nova Migração

```bash
python manage.py makemigrations
python manage.py migrate
```

### Acessar Shell Django

```bash
python manage.py shell
```

### Criar Dados de Teste

```bash
# Se houver comando seed implementado
python manage.py seed
```

### Admin Django

Acesse `/admin/` com credenciais de superusuário para gerenciar dados visualmente.

---

## 📊 Tecnologias

- **Framework:** Django 5.2.7
- **API:** Django REST Framework
- **Autenticação:** JWT (djangorestframework-simplejwt)
- **Banco de Dados:** SQLite3 (dev) / PostgreSQL ou MySQL (prod)
- **Python:** 3.10+

---

## 🚧 Roadmap

- [ ] Upload de arquivos para recursos
- [ ] Paginação para listas grandes
- [ ] Filtros e busca avançada
- [ ] Sistema de notificações
- [ ] Tracking de progresso do aluno
- [ ] Geração de certificados
- [ ] WebSockets para atualizações em tempo real
- [ ] Rate limiting
- [ ] Logs de auditoria
- [ ] Testes automatizados completos

---

## 📝 Licença

Projeto educacional - StudyHub

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa nos arquivos `.md`
2. Verifique a seção de Troubleshooting na [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Revise os exemplos de uso na [PERMISSIONS_DOCUMENTATION.md](./PERMISSIONS_DOCUMENTATION.md)

---

**Última Atualização:** Outubro 2025  
**Versão:** 1.0  
**Status:** Em Desenvolvimento