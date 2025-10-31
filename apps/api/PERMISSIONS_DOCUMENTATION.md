# Documentação do Sistema de Permissões - StudyHub

## Índice
1. [Visão Geral](#visão-geral)
2. [Classes de Permissões](#classes-de-permissões)
3. [Aplicação por Endpoint](#aplicação-por-endpoint)
4. [Fluxos de Autorização](#fluxos-de-autorização)
5. [Cenários de Uso](#cenários-de-uso)
6. [Tabela de Referência Rápida](#tabela-de-referência-rápida)
7. [Testes de Permissões](#testes-de-permissões)

---

## Visão Geral

O StudyHub implementa um sistema de permissões granular baseado em:
- **Autenticação JWT:** Tokens com validade de 1 hora
- **Roles:** Admin (staff) e Aluno (usuário comum)
- **Ownership:** Recursos próprios vs. recursos de terceiros
- **Context-aware:** Regras baseadas em matrículas e datas

### Princípios

1. **Security by Default:** Tudo é bloqueado por padrão, apenas o explicitamente permitido é liberado
2. **Separation of Concerns:** Admin tem controle total, Aluno tem acesso limitado e contextual
3. **Data Privacy:** Alunos só veem seus próprios dados pessoais
4. **Progressive Disclosure:** Recursos são liberados baseado em regras temporais

---

## Classes de Permissões

### 1. IsAdmin

**Arquivo:** `classroom/permissions.py`

**Descrição:** Restringe acesso apenas a administradores (staff users).

**Código:**
```python
class IsAdmin(BasePermission):
    """
    Permissão para administradores (staff).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff
```

**Comportamento:**
- ✅ Permite: `request.user.is_staff == True`
- ❌ Bloqueia: Todos os outros usuários (incluindo autenticados não-staff)

**Uso:** Endpoints puramente administrativos (não implementados atualmente no projeto base)

---

### 2. IsAdminOrReadOnly

**Arquivo:** `classroom/permissions.py`

**Descrição:** Admin pode fazer qualquer operação, usuários autenticados podem apenas ler.

**Código:**
```python
class IsAdminOrReadOnly(BasePermission):
    """
    Admin: CRUD completo
    Aluno autenticado: Somente leitura (GET, HEAD, OPTIONS)
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return request.method in SAFE_METHODS
```

**Comportamento:**

| User Type | GET/HEAD/OPTIONS | POST | PUT/PATCH | DELETE |
|-----------|------------------|------|-----------|--------|
| Não autenticado | ❌ | ❌ | ❌ | ❌ |
| Aluno autenticado | ✅ | ❌ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

**Safe Methods:** `GET`, `HEAD`, `OPTIONS`

**Aplicado em:**
- `TreinamentoViewSet` - Todos podem ver treinamentos, apenas admin pode gerenciar

**Caso de Uso:**
- Catálogo de treinamentos disponíveis
- Alunos navegam e veem informações
- Apenas admin cria/edita/deleta

---

### 3. IsOwnerOrAdmin

**Arquivo:** `classroom/permissions.py`

**Descrição:** Permite que usuários acessem apenas seus próprios dados. Admin tem acesso a tudo.

**Código:**
```python
class IsOwnerOrAdmin(BasePermission):
    """
    Admin: acesso a tudo
    Aluno: acesso somente aos próprios dados (somente leitura)
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if hasattr(obj, "user"):
            return obj.user == request.user
        elif hasattr(obj, "aluno"):
            return obj.aluno.user == request.user

        return False
```

**Comportamento em 2 Níveis:**

#### Nível de Lista (has_permission)
- Não autenticado: ❌ Bloqueado
- Aluno: ✅ Pode listar (QuerySet filtrado na view)
- Admin: ✅ Lista tudo

#### Nível de Objeto (has_object_permission)
- Admin: ✅ Acesso total a qualquer objeto
- Aluno: ✅ Se `obj.user == request.user` ou `obj.aluno.user == request.user`
- Aluno: ❌ Para objetos de outros usuários

**Aplicado em:**
- `AlunoViewSet` - Aluno vê apenas seu próprio perfil
- `MatriculaViewSet` - Aluno vê apenas suas próprias matrículas

**Filtro de QuerySet (implementado nas views):**
```python
# AlunoViewSet
def get_queryset(self):
    if self.request.user.is_staff:
        return queryset
    return queryset.filter(user=self.request.user)

# MatriculaViewSet
def get_queryset(self):
    if self.request.user.is_staff:
        return queryset
    aluno = self.request.user.alunos
    return queryset.filter(aluno=aluno)
```

**Caso de Uso:**
- Privacidade de dados pessoais
- Aluno A não vê dados do Aluno B
- Admin vê todos os alunos

---

### 4. IsEnrolledStudentOrAdmin

**Arquivo:** `classroom/permissions.py`

**Descrição:** Admin vê todas as turmas. Aluno vê apenas turmas onde está matriculado.

**Código:**
```python
class IsEnrolledStudentOrAdmin(BasePermission):
    """
    Para Turmas: admin vê tudo, aluno vê apenas turmas onde está matriculado
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if request.method not in SAFE_METHODS:
            return False

        try:
            aluno = request.user.alunos
            return obj.matriculas.filter(aluno=aluno).exists()
        except:
            return False
```

**Comportamento:**

#### Nível de Lista
- Não autenticado: ❌
- Autenticado: ✅ (QuerySet filtrado)

#### Nível de Objeto
- Admin: ✅ Qualquer turma, qualquer operação
- Aluno matriculado: ✅ Somente leitura da turma
- Aluno não matriculado: ❌ Bloqueado
- Qualquer usuário: ❌ Para operações de escrita (POST/PUT/DELETE)

**Aplicado em:**
- `TurmaViewSet`

**Filtro de QuerySet:**
```python
def get_queryset(self):
    if self.request.user.is_staff:
        return queryset
    
    aluno = self.request.user.alunos
    return queryset.filter(matriculas__aluno=aluno).distinct()
```

**Lógica de Verificação:**
1. Admin? → Acesso total
2. Método de escrita? → Bloqueia
3. Existe matrícula do aluno nesta turma? → Permite leitura
4. Caso contrário → Bloqueia

**Caso de Uso:**
- Aluno vê apenas turmas em que está inscrito
- Não pode ver turmas de outros alunos
- Não pode modificar turmas

---

### 5. IsEnrolledAndResourceAccessible

**Arquivo:** `classroom/permissions.py`

**Descrição:** Controle mais complexo baseado em matrícula, data de início e flags de draft/acesso_previo.

**Código:**
```python
class IsEnrolledAndResourceAccessible(BasePermission):
    """
    Para Recursos: admin vê tudo, aluno vê apenas recursos das turmas matriculadas
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if request.method not in SAFE_METHODS:
            return False

        try:
            aluno = request.user.alunos
            matriculado = obj.turma.matriculas.filter(aluno=aluno).exists()
            if not matriculado:
                return False

            hoje = date.today()
            if hoje < obj.turma.data_inicio:
                return obj.acesso_previo
            else:
                return not obj.draft
        except:
            return False
```

**Comportamento:**

#### Fluxo de Decisão (Aluno)

```
1. Está autenticado?
   └─ Não → ❌ BLOQUEADO

2. É admin?
   └─ Sim → ✅ PERMITIDO (acesso total)

3. Método de escrita (POST/PUT/DELETE)?
   └─ Sim → ❌ BLOQUEADO

4. Está matriculado na turma do recurso?
   └─ Não → ❌ BLOQUEADO

5. Hoje < data_inicio da turma?
   └─ Sim:
      └─ acesso_previo == True?
         └─ Sim → ✅ PERMITIDO
         └─ Não → ❌ BLOQUEADO
   └─ Não (turma já começou):
      └─ draft == False?
         └─ Sim → ✅ PERMITIDO
         └─ Não → ❌ BLOQUEADO (recurso em rascunho)
```

**Aplicado em:**
- `RecursoViewSet`

**Filtro de QuerySet:**
```python
def get_queryset(self):
    if self.request.user.is_staff:
        return queryset
    
    aluno = self.request.user.alunos
    return queryset.filter(
        draft=False,
        turma__matriculas__aluno=aluno,
    ).distinct()
```

**Flags de Controle:**

| Flag | Descrição | Uso |
|------|-----------|-----|
| `draft` | Recurso em rascunho | Admin pode criar recurso antes de publicar |
| `acesso_previo` | Liberação antecipada | Material disponível antes da turma começar |

**Matriz de Acesso (Aluno Matriculado):**

| Situação | draft=False acesso_previo=False | draft=False acesso_previo=True | draft=True acesso_previo=False | draft=True acesso_previo=True |
|----------|--------------------------------|-------------------------------|-------------------------------|------------------------------|
| Antes da data_inicio | ❌ | ✅ | ❌ | ❌ |
| Depois da data_inicio | ✅ | ✅ | ❌ | ❌ |

**Nota:** `draft=True` sempre bloqueia para alunos, independente de outras flags.

**Casos de Uso:**
1. **Material de Preparação:** Admin cria recurso com `acesso_previo=True` e `draft=False` → Alunos acessam antes do início
2. **Conteúdo Progressivo:** Recursos com `acesso_previo=False` → Só ficam visíveis após data_inicio
3. **Rascunhos:** Admin trabalha em recursos com `draft=True` → Invisível para alunos até publicar

---

## Aplicação por Endpoint

### Alunos (`/api/alunos/`)

**Permissão:** `IsOwnerOrAdmin`

```python
class AlunoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrAdmin]
```

| Ação | Admin | Aluno (próprio) | Aluno (outros) |
|------|-------|-----------------|----------------|
| LIST | ✅ Todos | ✅ Próprio | ❌ |
| CREATE | ✅ | ✅ | N/A |
| RETRIEVE | ✅ Qualquer | ✅ Próprio | ❌ |
| UPDATE | ✅ Qualquer | ❌ | ❌ |
| DELETE | ✅ Qualquer | ❌ | ❌ |
| GET /id/matriculas/ | ✅ | ✅ Próprio | ❌ |

---

### Treinamentos (`/api/treinamentos/`)

**Permissão:** `IsAdminOrReadOnly`

```python
class TreinamentoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
```

| Ação | Admin | Aluno | Não Auth |
|------|-------|-------|----------|
| LIST | ✅ | ✅ | ❌ |
| CREATE | ✅ | ❌ | ❌ |
| RETRIEVE | ✅ | ✅ | ❌ |
| UPDATE | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |
| GET /id/turmas/ | ✅ | ✅ | ❌ |

**Observação:** Todos os usuários autenticados podem ver todos os treinamentos (catálogo público interno).

---

### Turmas (`/api/turmas/`)

**Permissão:** `IsEnrolledStudentOrAdmin`

```python
class TurmaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsEnrolledStudentOrAdmin]
```

| Ação | Admin | Aluno (matriculado) | Aluno (não matriculado) |
|------|-------|---------------------|-------------------------|
| LIST | ✅ Todas | ✅ Matriculadas | ❌ (QuerySet vazio) |
| CREATE | ✅ | ❌ | ❌ |
| RETRIEVE | ✅ Qualquer | ✅ Se matriculado | ❌ |
| UPDATE | ✅ Qualquer | ❌ | ❌ |
| DELETE | ✅ Qualquer | ❌ | ❌ |
| GET /id/alunos/ | ✅ | ✅ Se matriculado | ❌ |
| GET /id/recursos/ | ✅ | ✅ Se matriculado | ❌ |

---

### Matrículas (`/api/matriculas/`)

**Permissão:** `IsOwnerOrAdmin`

```python
class MatriculaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrAdmin]
```

| Ação | Admin | Aluno (própria) | Aluno (outros) |
|------|-------|-----------------|----------------|
| LIST | ✅ Todas | ✅ Próprias | ❌ |
| CREATE | ✅ | ❌ | ❌ |
| RETRIEVE | ✅ Qualquer | ✅ Própria | ❌ |
| UPDATE | ✅ Qualquer | ❌ | ❌ |
| DELETE | ✅ Qualquer | ❌ | ❌ |

**Observação:** Apenas admin pode criar matrículas (processo de inscrição controlado).

---

### Recursos (`/api/recursos/`)

**Permissão:** `IsEnrolledAndResourceAccessible`

```python
class RecursoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsEnrolledAndResourceAccessible]
```

| Ação | Admin | Aluno (matriculado, acessível) | Aluno (não acessível) |
|------|-------|---------------------------------|-----------------------|
| LIST | ✅ Todos | ✅ Acessíveis* | ❌ (QuerySet filtrado) |
| CREATE | ✅ | ❌ | ❌ |
| RETRIEVE | ✅ Qualquer | ✅ Se acessível* | ❌ |
| UPDATE | ✅ Qualquer | ❌ | ❌ |
| DELETE | ✅ Qualquer | ❌ | ❌ |

\* **Acessível** = Matriculado na turma + (antes: acesso_previo=True OU depois: draft=False)

---

## Fluxos de Autorização

### Fluxo 1: Login e Acesso

```
1. Cliente → POST /api/auth/token
   Body: {username, password}

2. API valida credenciais
   ├─ Inválidas → 401 Unauthorized
   └─ Válidas → Gera JWT

3. API → Cliente
   Response: {access: "eyJ0eXAi..."}

4. Cliente armazena token

5. Cliente → GET /api/turmas/
   Header: Authorization: Bearer eyJ0eXAi...

6. DRF valida JWT
   ├─ Inválido → 401 Unauthorized
   ├─ Expirado → 401 Unauthorized
   └─ Válido → Extrai user_id

7. DRF checa permissão
   ├─ is_staff? → Retorna todas as turmas
   └─ Aluno? → Filtra turmas matriculadas

8. API → Cliente
   Response: [lista de turmas]
```

---

### Fluxo 2: Acesso a Recurso (Aluno)

```
1. Aluno → GET /api/recursos/15/
   Header: Authorization: Bearer <token>

2. Autenticação JWT
   └─ Token válido? ✅

3. Permission Check: IsEnrolledAndResourceAccessible
   ├─ has_permission()
   │  └─ Autenticado? ✅ → Prossegue
   │
   └─ has_object_permission(recurso_15)
      │
      ├─ É admin? → Não
      │
      ├─ Método seguro (GET)? → Sim ✅
      │
      ├─ Matriculado na turma do recurso?
      │  Query: Matricula.objects.filter(
      │           aluno=aluno, 
      │           turma=recurso_15.turma
      │         ).exists()
      │  └─ Sim ✅
      │
      ├─ Hoje (2024-10-28) < Turma.data_inicio (2024-11-01)?
      │  └─ Sim (turma ainda não começou)
      │     └─ recurso_15.acesso_previo == True?
      │        ├─ Sim → ✅ PERMITIDO
      │        └─ Não → ❌ BLOQUEADO (403 Forbidden)
      │
      └─ Ou: Hoje >= Turma.data_inicio?
         └─ Sim (turma já começou)
            └─ recurso_15.draft == False?
               ├─ Sim → ✅ PERMITIDO
               └─ Não → ❌ BLOQUEADO (403 Forbidden)
```

---

### Fluxo 3: Admin Criando Matrícula

```
1. Admin → POST /api/matriculas/
   Header: Authorization: Bearer <admin_token>
   Body: {aluno: 5, turma: 3}

2. Autenticação JWT
   └─ Token válido? ✅
   └─ user.is_staff? ✅

3. Permission Check: IsOwnerOrAdmin
   ├─ has_permission()
   │  └─ is_staff? ✅ → PERMITIDO
   │
   └─ (has_object_permission não chamado no CREATE)

4. Validação de dados
   ├─ aluno_id existe?
   ├─ turma_id existe?
   └─ Combinação única? (aluno, turma)
      └─ Já matriculado? → 400 Bad Request

5. Criação no banco
   INSERT INTO classroom_matricula 
   VALUES (aluno_id=5, turma_id=3, data_matricula=NOW())

6. API → Admin
   Response: 201 Created
   Body: {
     id: 10,
     aluno: 5,
     turma: 3,
     data_matricula: "2024-10-28T14:30:00Z"
   }
```

---

## Cenários de Uso

### Cenário 1: Aluno Navegando Plataforma

**Contexto:** Aluno João (aluno1) logado, matriculado na Turma 1 (Python Básico).

**Ações e Resultados:**

```bash
# 1. Ver todos os treinamentos
GET /api/treinamentos/
→ 200 OK [Python Básico, Django Avançado, React Completo, ...]

# 2. Ver suas turmas
GET /api/turmas/
→ 200 OK [Turma 1 - Python Básico]
# Não vê Turma 2 porque não está matriculado

# 3. Ver turma específica matriculada
GET /api/turmas/1/
→ 200 OK {...dados da Turma 1...}

# 4. Tentar ver turma não matriculada
GET /api/turmas/2/
→ 403 Forbidden

# 5. Ver recursos da sua turma
GET /api/turmas/1/recursos/
→ 200 OK [
  {id: 1, nome: "Apostila Módulo 1", draft: false, acesso_previo: false},
  {id: 2, nome: "Boas-vindas", draft: false, acesso_previo: true}
]
# Não vê recursos com draft=true

# 6. Ver seu perfil
GET /api/alunos/1/
→ 200 OK {id: 1, nome: "João", email: "joao@..."}

# 7. Tentar ver perfil de outro aluno
GET /api/alunos/2/
→ 403 Forbidden

# 8. Ver suas matrículas
GET /api/alunos/1/matriculas/
→ 200 OK [{id: 1, aluno: 1, turma: 1, data_matricula: "..."}]

# 9. Tentar criar matrícula
POST /api/matriculas/
→ 403 Forbidden (apenas admin)

# 10. Tentar editar treinamento
PATCH /api/treinamentos/1/
→ 403 Forbidden (apenas admin)
```

---

### Cenário 2: Admin Gerenciando Turma

**Contexto:** Admin logado.

**Ações e Resultados:**

```bash
# 1. Criar novo treinamento
POST /api/treinamentos/
Body: {nome: "DevOps Essencial", descricao: "CI/CD e containers"}
→ 201 Created

# 2. Criar turma
POST /api/turmas/
Body: {
  treinamento: 5,
  nome: "Turma Out/2024",
  data_inicio: "2024-11-15",
  link_acesso: "https://meet.google.com/abc"
}
→ 201 Created

# 3. Criar recurso em draft
POST /api/recursos/
Body: {
  turma: 8,
  tipo: "PDF",
  nome: "Apostila DevOps",
  draft: true,
  acesso_previo: false
}
→ 201 Created

# 4. Matricular alunos
POST /api/matriculas/
Body: {aluno: 3, turma: 8}
→ 201 Created

POST /api/matriculas/
Body: {aluno: 4, turma: 8}
→ 201 Created

# 5. Publicar recurso (remover draft)
PATCH /api/recursos/15/
Body: {draft: false}
→ 200 OK

# 6. Ver todos os alunos
GET /api/alunos/
→ 200 OK [todos os alunos]

# 7. Ver todas as turmas
GET /api/turmas/
→ 200 OK [todas as turmas]

# 8. Ver alunos de uma turma
GET /api/turmas/8/alunos/
→ 200 OK [{aluno: 3, ...}, {aluno: 4, ...}]
```

---

### Cenário 3: Liberação Progressiva de Conteúdo

**Contexto:** Turma com data_inicio = 2024-11-10, hoje = 2024-11-05 (5 dias antes).

**Recursos da Turma:**

| ID | Nome | draft | acesso_previo |
|----|------|-------|---------------|
| 20 | Boas-vindas | false | true |
| 21 | Cronograma | false | true |
| 22 | Aula 1 | false | false |
| 23 | Aula 2 (preparando) | true | false |

**Acesso do Aluno (hoje = 2024-11-05):**

```bash
# Recurso 20 (acesso_previo=true, draft=false)
GET /api/recursos/20/
→ 200 OK ✅ (liberado antes do início)

# Recurso 21 (acesso_previo=true, draft=false)
GET /api/recursos/21/
→ 200 OK ✅ (liberado antes do início)

# Recurso 22 (acesso_previo=false, draft=false)
GET /api/recursos/22/
→ 403 Forbidden ❌ (só após 2024-11-10)

# Recurso 23 (draft=true)
GET /api/recursos/23/
→ 403 Forbidden ❌ (draft sempre bloqueia aluno)
```

**Acesso do Aluno (hoje = 2024-11-12, turma já começou):**

```bash
# Recurso 20
GET /api/recursos/20/
→ 200 OK ✅

# Recurso 21
GET /api/recursos/21/
→ 200 OK ✅

# Recurso 22 (agora liberado)
GET /api/recursos/22/
→ 200 OK ✅

# Recurso 23 (ainda draft)
GET /api/recursos/23/
→ 403 Forbidden ❌
```

**Acesso do Admin (qualquer dia):**

```bash
# Admin vê TODOS os recursos, independente de flags
GET /api/recursos/20/
→ 200 OK ✅

GET /api/recursos/23/
→ 200 OK ✅ (mesmo draft)
```

---

## Tabela de Referência Rápida

### Matriz Geral de Permissões

| Endpoint | Ação | Admin | Aluno (próprio/matriculado) | Aluno (outros) | Não Auth |
|----------|------|-------|-----------------------------|----------------|----------|
| **Alunos** |
| /alunos/ | LIST | ✅ Todos | ✅ Próprio | N/A | ❌ |
| /alunos/ | CREATE | ✅ | ✅ | N/A | ❌ |
| /alunos/:id/ | GET | ✅ | ✅ Próprio | ❌ | ❌ |
| /alunos/:id/ | UPDATE | ✅ | ❌ | ❌ | ❌ |
| /alunos/:id/ | DELETE | ✅ | ❌ | ❌ | ❌ |
| **Treinamentos** |
| /treinamentos/ | LIST | ✅ | ✅ Todos | N/A | ❌ |
| /treinamentos/ | CREATE | ✅ | ❌ | N/A | ❌ |
| /treinamentos/:id/ | GET | ✅ | ✅ | N/A | ❌ |
| /treinamentos/:id/ | UPDATE | ✅ | ❌ | N/A | ❌ |
| /treinamentos/:id/ | DELETE | ✅ | ❌ | N/A | ❌ |
| **Turmas** |
| /turmas/ | LIST | ✅ Todas | ✅ Matriculadas | N/A | ❌ |
| /turmas/ | CREATE | ✅ | ❌ | N/A | ❌ |
| /turmas/:id/ | GET | ✅ | ✅ Se matriculado | ❌ | ❌ |
| /turmas/:id/ | UPDATE | ✅ | ❌ | ❌ | ❌ |
| /turmas/:id/ | DELETE | ✅ | ❌ | ❌ | ❌ |
| **Matrículas** |
| /matriculas/ | LIST | ✅ Todas | ✅ Próprias | N/A | ❌ |
| /matriculas/ | CREATE | ✅ | ❌ | N/A | ❌ |
| /matriculas/:id/ | GET | ✅ | ✅ Própria | ❌ | ❌ |
| /matriculas/:id/ | DELETE | ✅ | ❌ | ❌ | ❌ |
| **Recursos** |
| /recursos/ | LIST | ✅ Todos | ✅ Acessíveis* | N/A | ❌ |
| /recursos/ | CREATE | ✅ | ❌ | N/A | ❌ |
| /recursos/:id/ | GET | ✅ | ✅ Se acessível* | ❌ | ❌ |
| /recursos/:id/ | UPDATE | ✅ | ❌ | ❌ | ❌ |
| /recursos/:id/ | DELETE | ✅ | ❌ | ❌ | ❌ |

\* Acessível = Matriculado + (Antes início: acesso_previo=True OU Depois início: draft=False)

---

### Códigos HTTP de Permissão

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| 200 | OK | Acesso permitido |
| 201 | Created | Recurso criado com sucesso |
| 401 | Unauthorized | Token ausente, inválido ou expirado |
| 403 | Forbidden | Token válido mas sem permissão para ação |
| 404 | Not Found | Recurso não existe OU sem permissão* |

\* Alguns endpoints retornam 404 em vez de 403 para não revelar existência de recursos

---

## Testes de Permissões

### Testes Manuais com cURL

#### Teste 1: Acesso sem Token
```bash
curl -X GET http://localhost:8000/api/turmas/
# Esperado: 401 Unauthorized
```

#### Teste 2: Acesso com Token Inválido
```bash
curl -X GET http://localhost:8000/api/turmas/ \
  -H "Authorization: Bearer token_invalido"
# Esperado: 401 Unauthorized
```

#### Teste 3: Aluno Acessando Turma Não Matriculada
```bash
# Login como aluno1
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"aluno1","password":"senha123"}' \
  | jq -r '.access')

# Tentar acessar turma 5 (não matriculado)
curl -X GET http://localhost:8000/api/turmas/5/ \
  -H "Authorization: Bearer $TOKEN"
# Esperado: 403 Forbidden
```

#### Teste 4: Aluno Tentando Criar Matrícula
```bash
curl -X POST http://localhost:8000/api/matriculas/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"aluno":1,"turma":2}'
# Esperado: 403 Forbidden
```

#### Teste 5: Admin Acessando Tudo
```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.access')

# Admin vê todas as turmas
curl -X GET http://localhost:8000/api/turmas/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Esperado: 200 OK (lista completa)

# Admin cria matrícula
curl -X POST http://localhost:8000/api/matriculas/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"aluno":1,"turma":2}'
# Esperado: 201 Created
```

---

### Testes Automatizados (Exemplo)

```python
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from classroom.models import Aluno, Treinamento, Turma, Matricula

class PermissionTests(TestCase):
    def setUp(self):
        # Criar admin
        self.admin = User.objects.create_superuser(
            username='admin',
            password='admin123'
        )
        
        # Criar aluno
        self.user_aluno = User.objects.create_user(
            username='aluno1',
            password='senha123'
        )
        self.aluno = Aluno.objects.create(
            user=self.user_aluno,
            nome='Aluno 1',
            email='aluno1@test.com'
        )
        
        # Criar treinamento e turmas
        self.treinamento = Treinamento.objects.create(
            nome='Python'
        )
        self.turma1 = Turma.objects.create(
            treinamento=self.treinamento,
            nome='Turma 1',
            data_inicio='2024-11-01'
        )
        self.turma2 = Turma.objects.create(
            treinamento=self.treinamento,
            nome='Turma 2',
            data_inicio='2024-12-01'
        )
        
        # Matricular aluno apenas na turma1
        Matricula.objects.create(
            aluno=self.aluno,
            turma=self.turma1
        )
        
        self.client = APIClient()
    
    def test_aluno_nao_ve_turma_nao_matriculada(self):
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.get(f'/api/turmas/{self.turma2.id}/')
        self.assertEqual(response.status_code, 403)
    
    def test_aluno_ve_turma_matriculada(self):
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.get(f'/api/turmas/{self.turma1.id}/')
        self.assertEqual(response.status_code, 200)
    
    def test_admin_ve_todas_turmas(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/turmas/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
    
    def test_aluno_nao_pode_criar_matricula(self):
        self.client.force_authenticate(user=self.user_aluno)
        response = self.client.post('/api/matriculas/', {
            'aluno': self.aluno.id,
            'turma': self.turma2.id
        })
        self.assertEqual(response.status_code, 403)
    
    def test_admin_pode_criar_matricula(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/matriculas/', {
            'aluno': self.aluno.id,
            'turma': self.turma2.id
        })
        self.assertEqual(response.status_code, 201)
```

---

## Conclusão

O sistema de permissões do StudyHub oferece:

1. **Segurança:** Acesso controlado baseado em roles e ownership
2. **Flexibilidade:** Regras contextuais (matrícula, datas, flags)
3. **Privacidade:** Isolamento de dados entre alunos
4. **Controle Temporal:** Liberação progressiva de conteúdo
5. **Gestão Administrativa:** Controle total para staff

**Próximos Passos:**
- Implementar rate limiting
- Adicionar logs de auditoria de acessos
- Implementar notificações de novos recursos
- Sistema de convites para matrículas
- Permissões granulares por recurso (ex: alguns alunos podem editar)

---

**Última Atualização:** Outubro 2025
**Versão:** 1.0
**Django Version:** 5.2.7
**DRF Version:** Latest
