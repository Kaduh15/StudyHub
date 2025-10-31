# Documentação da API - StudyHub

## Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints da API](#endpoints-da-api)
4. [Modelos de Dados](#modelos-de-dados)
5. [Sistema de Permissões](#sistema-de-permissões)
6. [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

A API do StudyHub é construída com Django REST Framework e fornece endpoints para gerenciamento de treinamentos, turmas, alunos, matrículas e recursos educacionais.

**Base URL:** `/api/`

**Formato de Dados:** JSON

**Autenticação:** JWT (JSON Web Tokens)

---

## Autenticação

### Obter Token de Acesso

**Endpoint:** `POST /api/auth/token`

**Descrição:** Gera um token JWT para autenticação nas requisições subsequentes.

**Body:**
```json
{
  "username": "usuario",
  "password": "senha"
}
```

**Resposta (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Nota:** O refresh token está desabilitado. O token de acesso tem validade de 1 hora.

### Usando o Token

Inclua o token no header de todas as requisições autenticadas:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## Endpoints da API

### 1. Alunos

**Base:** `/api/alunos/`

#### Listar Alunos
- **Método:** `GET /api/alunos/`
- **Permissão:** Admin (todos) ou Aluno autenticado (apenas próprio registro)
- **Resposta:** Lista de alunos

#### Criar Aluno
- **Método:** `POST /api/alunos/`
- **Permissão:** Admin e autenticado
- **Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "11999999999",
  "turma_id": 1
}
```
- **Resposta (201 Created):**
```json
{
  "detail": "Aluno criado com sucesso.",
  "data": {
    "id": 1,
    "user": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999999999"
  }
}
```

#### Obter Aluno
- **Método:** `GET /api/alunos/{id}/`
- **Permissão:** Admin ou o próprio aluno
- **Resposta:** Detalhes do aluno

#### Atualizar Aluno
- **Método:** `PUT/PATCH /api/alunos/{id}/`
- **Permissão:** Admin
- **Body:** Campos a atualizar
- **Resposta:** Aluno atualizado

#### Deletar Aluno
- **Método:** `DELETE /api/alunos/{id}/`
- **Permissão:** Admin
- **Resposta:** 204 No Content

#### Listar Matrículas do Aluno
- **Método:** `GET /api/alunos/{id}/matriculas/`
- **Permissão:** Admin ou o próprio aluno
- **Resposta:** Lista de matrículas do aluno

---

### 2. Treinamentos

**Base:** `/api/treinamentos/`

#### Listar Treinamentos
- **Método:** `GET /api/treinamentos/`
- **Permissão:** Qualquer usuário autenticado (leitura)
- **Resposta:** Lista de treinamentos

#### Criar Treinamento
- **Método:** `POST /api/treinamentos/`
- **Permissão:** Admin
- **Body:**
```json
{
  "nome": "Python Avançado",
  "descricao": "Curso completo de Python avançado"
}
```
- **Resposta (201 Created):** Treinamento criado

#### Obter Treinamento
- **Método:** `GET /api/treinamentos/{id}/`
- **Permissão:** Qualquer usuário autenticado
- **Resposta:** Detalhes do treinamento

#### Atualizar Treinamento
- **Método:** `PUT/PATCH /api/treinamentos/{id}/`
- **Permissão:** Admin
- **Body:** Campos a atualizar
- **Resposta:** Treinamento atualizado

#### Deletar Treinamento
- **Método:** `DELETE /api/treinamentos/{id}/`
- **Permissão:** Admin
- **Resposta:** 204 No Content

#### Listar Turmas do Treinamento
- **Método:** `GET /api/treinamentos/{id}/turmas/`
- **Permissão:** Qualquer usuário autenticado
- **Resposta:** Lista de turmas do treinamento

---

### 3. Turmas

**Base:** `/api/turmas/`

#### Listar Turmas
- **Método:** `GET /api/turmas/`
- **Permissão:** Admin (todas) ou Aluno (apenas turmas matriculadas)
- **Resposta:** Lista de turmas

#### Criar Turma
- **Método:** `POST /api/turmas/`
- **Permissão:** Admin
- **Body:**
```json
{
  "treinamento": 1,
  "nome": "Turma 2024-01",
  "data_inicio": "2024-01-15",
  "data_conclusao": "2024-06-30",
  "link_acesso": "https://example.com/turma/2024-01"
}
```
- **Resposta (201 Created):** Turma criada

#### Obter Turma
- **Método:** `GET /api/turmas/{id}/`
- **Permissão:** Admin ou Aluno matriculado na turma
- **Resposta:** Detalhes da turma

#### Atualizar Turma
- **Método:** `PUT/PATCH /api/turmas/{id}/`
- **Permissão:** Admin
- **Body:** Campos a atualizar
- **Resposta:** Turma atualizada

#### Deletar Turma
- **Método:** `DELETE /api/turmas/{id}/`
- **Permissão:** Admin
- **Resposta:** 204 No Content

#### Listar Alunos da Turma
- **Método:** `GET /api/turmas/{id}/alunos/`
- **Permissão:** Admin ou Aluno matriculado na turma
- **Resposta:** Lista de matrículas/alunos da turma

#### Listar Recursos da Turma
- **Método:** `GET /api/turmas/{id}/recursos/`
- **Permissão:** Admin ou Aluno matriculado na turma
- **Resposta:** Lista de recursos da turma

---

### 4. Matrículas

**Base:** `/api/matriculas/`

#### Listar Matrículas
- **Método:** `GET /api/matriculas/`
- **Permissão:** Admin (todas) ou Aluno (apenas próprias matrículas)
- **Resposta:** Lista de matrículas

#### Criar Matrícula
- **Método:** `POST /api/matriculas/`
- **Permissão:** Admin
- **Body:**
```json
{
  "aluno": 1,
  "turma": 1
}
```
- **Resposta (201 Created):** Matrícula criada
- **Nota:** A combinação aluno + turma deve ser única

#### Obter Matrícula
- **Método:** `GET /api/matriculas/{id}/`
- **Permissão:** Admin ou o próprio aluno
- **Resposta:** Detalhes da matrícula

#### Deletar Matrícula
- **Método:** `DELETE /api/matriculas/{id}/`
- **Permissão:** Admin
- **Resposta:** 204 No Content

---

### 5. Recursos

**Base:** `/api/recursos/`

#### Listar Recursos
- **Método:** `GET /api/recursos/`
- **Permissão:** Admin (todos) ou Aluno (apenas recursos acessíveis)
- **Resposta:** Lista de recursos
- **Nota:** Alunos só veem recursos não-draft de turmas matriculadas

#### Criar Recurso
- **Método:** `POST /api/recursos/`
- **Permissão:** Admin
- **Body:**
```json
{
  "turma": 1,
  "tipo": "PDF",
  "nome": "Apostila Python - Módulo 1",
  "descricao": "Material de apoio para o módulo 1",
  "acesso_previo": false,
  "draft": false
}
```
- **Tipos Disponíveis:** `PDF`, `VIDEO`, `ZIP`
- **Resposta (201 Created):** Recurso criado

#### Obter Recurso
- **Método:** `GET /api/recursos/{id}/`
- **Permissão:** Admin ou Aluno matriculado (com regras de acesso)
- **Resposta:** Detalhes do recurso
- **Regras de Acesso:**
  - Se `data_atual < data_inicio_turma`: Só acessível se `acesso_previo = true`
  - Se `data_atual >= data_inicio_turma`: Só acessível se `draft = false`

#### Atualizar Recurso
- **Método:** `PUT/PATCH /api/recursos/{id}/`
- **Permissão:** Admin
- **Body:** Campos a atualizar
- **Resposta:** Recurso atualizado

#### Deletar Recurso
- **Método:** `DELETE /api/recursos/{id}/`
- **Permissão:** Admin
- **Resposta:** 204 No Content

---

## Modelos de Dados

### Aluno
```python
{
  "id": int,
  "user": int,              # FK para User (Django)
  "nome": string(100),
  "email": string(unique),
  "telefone": string(15)    # Opcional
}
```

**Relacionamentos:**
- `user`: OneToOne com User (Django Auth)
- `matriculas`: Muitas matrículas (reverse relation)

---

### Treinamento
```python
{
  "id": int,
  "nome": string(100),
  "descricao": text         # Opcional
}
```

**Relacionamentos:**
- `turmas`: Muitas turmas (reverse relation)

---

### Turma
```python
{
  "id": int,
  "treinamento": int,       # FK para Treinamento
  "nome": string(100),
  "data_inicio": date,
  "data_conclusao": date,   # Opcional
  "link_acesso": url        # Opcional
}
```

**Relacionamentos:**
- `treinamento`: ForeignKey para Treinamento
- `matriculas`: Muitas matrículas (reverse relation)
- `recursos`: Muitos recursos (reverse relation)

**Ordenação:** Por data_inicio (decrescente)

---

### Matrícula
```python
{
  "id": int,
  "aluno": int,             # FK para Aluno
  "turma": int,             # FK para Turma
  "data_matricula": datetime # Auto-gerado
}
```

**Relacionamentos:**
- `aluno`: ForeignKey para Aluno
- `turma`: ForeignKey para Turma

**Constraints:**
- `unique_together`: [aluno, turma] - Um aluno não pode se matricular duas vezes na mesma turma

**Ordenação:** Por data_matricula (decrescente)

---

### Recurso
```python
{
  "id": int,
  "turma": int,             # FK para Turma
  "tipo": string,           # Choices: PDF, VIDEO, ZIP
  "nome": string(100),
  "descricao": text,        # Opcional
  "acesso_previo": boolean, # Default: false
  "draft": boolean,         # Default: false
  "criado_em": datetime,    # Auto-gerado
  "atualizado_em": datetime # Auto-atualizado
}
```

**Tipos de Recurso:**
- `PDF`: Documento PDF
- `VIDEO`: Vídeo
- `ZIP`: Arquivo compactado

**Relacionamentos:**
- `turma`: ForeignKey para Turma

**Ordenação:** Por criado_em (decrescente)

---

## Sistema de Permissões

O sistema implementa 4 classes de permissões customizadas:

### 1. IsAdmin
**Usado em:** Endpoints administrativos

**Regra:** Apenas usuários com `is_staff = True`

**Efeito:**
- Admin: ✅ Acesso total
- Aluno: ❌ Sem acesso

---

### 2. IsAdminOrReadOnly
**Usado em:** Treinamentos

**Regras:**
- Admin: ✅ CRUD completo (Create, Read, Update, Delete)
- Aluno autenticado: ✅ Somente leitura (GET, HEAD, OPTIONS)
- Não autenticado: ❌ Sem acesso

**Métodos Seguros:** GET, HEAD, OPTIONS

---

### 3. IsOwnerOrAdmin
**Usado em:** Alunos, Matrículas

**Regras a nível de lista:**
- Admin: ✅ Vê todos os registros
- Aluno: ✅ Vê apenas seus próprios registros (somente leitura)
- Não autenticado: ❌ Sem acesso

**Regras a nível de objeto:**
- Admin: ✅ Acesso total a qualquer objeto
- Aluno: ✅ Acesso somente aos próprios dados (onde `obj.user == request.user` ou `obj.aluno.user == request.user`)

**Exemplo:** Um aluno só pode ver/editar seu próprio perfil e suas próprias matrículas

---

### 4. IsEnrolledStudentOrAdmin
**Usado em:** Turmas

**Regras a nível de lista:**
- Admin: ✅ Vê todas as turmas
- Aluno: ✅ Vê apenas turmas onde está matriculado
- Não autenticado: ❌ Sem acesso

**Regras a nível de objeto:**
- Admin: ✅ Acesso total a qualquer turma
- Aluno matriculado: ✅ Somente leitura da turma
- Aluno não matriculado: ❌ Sem acesso

**Filtro de QuerySet:** Alunos só recebem turmas onde `Matricula.objects.filter(aluno=aluno, turma=turma).exists()`

---

### 5. IsEnrolledAndResourceAccessible
**Usado em:** Recursos

**Regras Complexas:**

**A nível de lista:**
- Admin: ✅ Vê todos os recursos
- Aluno: ✅ Vê apenas recursos de turmas matriculadas com `draft = False`
- Não autenticado: ❌ Sem acesso

**A nível de objeto:**
- Admin: ✅ Acesso total
- Aluno não matriculado: ❌ Sem acesso
- Aluno matriculado:
  - Métodos de escrita (POST, PUT, DELETE): ❌ Bloqueado
  - Métodos de leitura (GET):
    - Se `hoje < turma.data_inicio`:
      - `acesso_previo = True`: ✅ Pode acessar
      - `acesso_previo = False`: ❌ Bloqueado
    - Se `hoje >= turma.data_inicio`:
      - `draft = False`: ✅ Pode acessar
      - `draft = True`: ❌ Bloqueado (recurso em rascunho)

**Casos de Uso:**
1. Admin criando recurso em draft antes da turma começar
2. Liberação antecipada de material (acesso_previo)
3. Recursos só ficam visíveis após início da turma (a menos que acesso_previo)

---

## Matriz de Permissões

| Endpoint | Admin | Aluno | Não Auth |
|----------|-------|-------|----------|
| **Alunos** | | | |
| LIST | Todos | Próprio | ❌ |
| CREATE | ✅ | ✅ | ❌ |
| RETRIEVE | ✅ | Próprio | ❌ |
| UPDATE | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |
| **Treinamentos** | | | |
| LIST | ✅ | ✅ | ❌ |
| CREATE | ✅ | ❌ | ❌ |
| RETRIEVE | ✅ | ✅ | ❌ |
| UPDATE | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |
| **Turmas** | | | |
| LIST | Todas | Matriculadas | ❌ |
| CREATE | ✅ | ❌ | ❌ |
| RETRIEVE | ✅ | Se matriculado | ❌ |
| UPDATE | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |
| **Matrículas** | | | |
| LIST | Todas | Próprias | ❌ |
| CREATE | ✅ | ❌ | ❌ |
| RETRIEVE | ✅ | Se própria | ❌ |
| UPDATE | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |
| **Recursos** | | | |
| LIST | Todos | Acessíveis* | ❌ |
| CREATE | ✅ | ❌ | ❌ |
| RETRIEVE | ✅ | Se acessível* | ❌ |
| UPDATE | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |

\* Recursos acessíveis seguem regras de `IsEnrolledAndResourceAccessible`

---

## Exemplos de Uso

### Exemplo 1: Login e Acesso

```bash
# 1. Obter token
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "aluno1",
    "password": "senha123"
  }'

# Resposta:
# {"access": "eyJ0eXAiOiJKV1QiLCJhbGc...", "is_staff": false}

# 2. Usar token para acessar API
curl -X GET http://localhost:8000/api/alunos/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

### Exemplo 2: Admin Criando Treinamento com Turma

```bash
# 1. Criar Treinamento
curl -X POST http://localhost:8000/api/treinamentos/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Django REST Framework",
    "descricao": "Construindo APIs com Django"
  }'

# Resposta: {"id": 5, "nome": "Django REST Framework", ...}

# 2. Criar Turma
curl -X POST http://localhost:8000/api/turmas/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "treinamento": 5,
    "nome": "Turma Janeiro/2024",
    "data_inicio": "2024-01-20",
    "data_conclusao": "2024-03-20",
    "link_acesso": "https://meet.google.com/abc-defg-hij"
  }'
```

---

### Exemplo 3: Admin Matriculando Aluno

```bash
curl -X POST http://localhost:8000/api/matriculas/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "aluno": 3,
    "turma": 5
  }'

# Resposta: {"id": 10, "aluno": 3, "turma": 5, "data_matricula": "2024-01-15T10:30:00Z"}
```

---

### Exemplo 4: Admin Criando Recurso com Acesso Prévio

```bash
# Criar recurso liberado antes do início da turma
curl -X POST http://localhost:8000/api/recursos/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "turma": 5,
    "tipo": "PDF",
    "nome": "Boas-vindas e Cronograma",
    "descricao": "Material de preparação",
    "acesso_previo": true,
    "draft": false
  }'

# Este recurso ficará acessível aos alunos matriculados mesmo antes da data_inicio
```

---

### Exemplo 5: Aluno Consultando Suas Turmas

```bash
# Aluno consulta suas turmas matriculadas
curl -X GET http://localhost:8000/api/turmas/ \
  -H "Authorization: Bearer $ALUNO_TOKEN"

# Resposta: Apenas turmas onde o aluno está matriculado

# Ver recursos de uma turma específica
curl -X GET http://localhost:8000/api/turmas/5/recursos/ \
  -H "Authorization: Bearer $ALUNO_TOKEN"

# Resposta: Recursos da turma (respeitando draft e acesso_previo)
```

---

### Exemplo 6: Aluno Tentando Acessar Recurso Draft

```bash
# Aluno tenta acessar recurso em draft
curl -X GET http://localhost:8000/api/recursos/15/ \
  -H "Authorization: Bearer $ALUNO_TOKEN"

# Resposta: 403 Forbidden (se draft=true)
# ou 200 OK com dados (se draft=false e outras regras satisfeitas)
```

---

## Códigos de Resposta HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| 200 | OK | Requisição bem-sucedida (GET, PUT, PATCH) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 204 | No Content | Recurso deletado com sucesso (DELETE) |
| 400 | Bad Request | Dados inválidos no body |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Token válido mas sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro no servidor |

---

## Configurações Importantes

### JWT Settings
```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),  # Token válido por 1 hora
    "REFRESH_TOKEN_LIFETIME": timedelta(seconds=0),  # Refresh desabilitado
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
}
```

### Database
- **Engine:** SQLite3
- **Location:** `apps/api/db.sqlite3`
- **Nota:** Em produção, considere usar PostgreSQL ou MySQL

### Locale
- **Language:** pt-BR
- **Timezone:** America/Sao_Paulo

---

## Notas de Desenvolvimento

### Transações
- A criação de alunos usa `@transaction.atomic` para garantir consistência entre User e Aluno

### Query Optimization
- Todas as views usam `select_related()` e `prefetch_related()` para otimizar queries
- Reduz N+1 queries

### Validações
- Email do aluno deve ser único
- Combinação aluno+turma deve ser única (constraint no banco)
- Tipos de recurso são validados por choices

---

## Admin Django

O projeto inclui interface administrativa do Django:

**URL:** `/admin/`

**Acesso:** Apenas usuários com `is_staff = True`

**Funcionalidades:**
- Gerenciamento visual de todos os modelos
- Criação de superusuários
- Visualização de relacionamentos

**Criar Superusuário:**
```bash
python manage.py createsuperuser
```

---

## Troubleshooting

### "Authentication credentials were not provided"
- Verifique se o header `Authorization: Bearer <token>` está presente
- Confirme que o token não expirou (1 hora de validade)

### "You do not have permission to perform this action"
- Verifique se o usuário tem as permissões necessárias (is_staff para ações admin)
- Confirme se o aluno está matriculado na turma (para acessar recursos/turmas)

### "This field may not be null"
- Verifique se todos os campos obrigatórios estão no body da requisição
- Campos opcionais: telefone, descricao, data_conclusao, link_acesso

### Recurso não aparece para aluno
- Verifique se `draft = False`
- Se antes da data_inicio, verifique se `acesso_previo = True`
- Confirme que o aluno está matriculado na turma do recurso

---

## Próximos Passos / Melhorias Futuras

1. **Upload de Arquivos:** Adicionar campo de file upload para recursos
2. **Paginação:** Implementar paginação para listas grandes
3. **Filtros e Busca:** Adicionar query params para filtrar e buscar
4. **Notificações:** Sistema de notificações para novos recursos/turmas
5. **Progresso:** Tracking de progresso do aluno nos recursos
6. **Certificados:** Geração automática de certificados após conclusão
7. **WebSockets:** Real-time updates para novos conteúdos
8. **Rate Limiting:** Proteção contra abuso da API
9. **Logs de Auditoria:** Registro de ações administrativas
10. **Testes Automatizados:** Suite completa de testes unitários e integração

---

## Contato e Suporte

Para dúvidas sobre a API, consulte:
- Documentação do Django REST Framework: https://www.django-rest-framework.org/
- Documentação do SimpleJWT: https://django-rest-framework-simplejwt.readthedocs.io/

---

**Última Atualização:** Outubro 2025
**Versão da API:** 1.0
**Django Version:** 5.2.7
**DRF Version:** Latest
