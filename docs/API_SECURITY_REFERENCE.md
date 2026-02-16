# API de Seguridad - Guía Rápida

## Índice
1. [Autenticación](#autenticación)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Gestión de Roles](#gestión-de-roles)
4. [Códigos de Respuesta](#códigos-de-respuesta)
5. [Ejemplos de Uso](#ejemplos-de-uso)

## Autenticación

### Iniciar Sesión
**Endpoint**: `POST /api/v1/auth/signin`  
**Autenticación**: No requiere  
**Roles**: Público

**Request Body**:
```json
{
  "username": "admin1",
  "password": "4dm1n"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjEiLCJpYXQiOjE2NzY...",
  "id": 1,
  "username": "admin1",
  "authority": "ADMIN"
}
```

**Uso del Token**:
```http
GET /api/v1/users
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjEi...
```

### Registrarse
**Endpoint**: `POST /api/v1/auth/signup`  
**Autenticación**: No requiere  
**Roles**: Público

**Request Body**:
```json
{
  "username": "newowner",
  "password": "SecurePass123!",
  "authority": "OWNER",
  "firstName": "María",
  "lastName": "González",
  "address": "Calle Principal 123",
  "city": "Sevilla",
  "telephone": "954123456"
}
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully!"
}
```

### Validar Token
**Endpoint**: `GET /api/v1/auth/validate`  
**Autenticación**: No requiere  
**Roles**: Público

**Query Parameters**:
- `token`: Token JWT a validar

**Request**:
```http
GET /api/v1/auth/validate?token=eyJhbGciOiJIUzUxMiJ9...
```

**Response**:
- `200 OK`: Token válido
- `401 Unauthorized`: Token inválido o expirado

## Gestión de Usuarios

> ⚠️ **Todos los endpoints de usuarios requieren rol ADMIN**

### Listar Todos los Usuarios
**Endpoint**: `GET /api/v1/users`  
**Autenticación**: Requerida (Bearer Token)  
**Roles**: ADMIN

**Query Parameters** (opcional):
- `auth`: Filtrar por autoridad/rol (ej: `OWNER`, `VET`, `ADMIN`, `CLINIC_OWNER`)

**Request**:
```http
GET /api/v1/users
Authorization: Bearer <admin-token>
```

**Request con filtro**:
```http
GET /api/v1/users?auth=OWNER
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "username": "admin1",
    "authority": {
      "id": 1,
      "authority": "ADMIN"
    }
  },
  {
    "id": 4,
    "username": "owner1",
    "authority": {
      "id": 3,
      "authority": "OWNER"
    }
  }
]
```

### Obtener Usuario por ID
**Endpoint**: `GET /api/v1/users/{id}`  
**Autenticación**: Requerida (Bearer Token)  
**Roles**: ADMIN

**Request**:
```http
GET /api/v1/users/1
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "admin1",
  "authority": {
    "id": 1,
    "authority": "ADMIN"
  }
}
```

### Crear Usuario
**Endpoint**: `POST /api/v1/users`  
**Autenticación**: Requerida (Bearer Token)  
**Roles**: ADMIN

**Request**:
```http
POST /api/v1/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "newvet",
  "password": "SecureVetPass123",
  "authority": {
    "id": 4,
    "authority": "VET"
  }
}
```

**Response** (201 Created):
```json
{
  "id": 20,
  "username": "newvet",
  "authority": {
    "id": 4,
    "authority": "VET"
  }
}
```

**Validaciones**:
- Username debe ser único
- Password es requerido
- Authority es requerida

### Actualizar Usuario
**Endpoint**: `PUT /api/v1/users/{userId}`  
**Autenticación**: Requerida (Bearer Token)  
**Roles**: ADMIN

**Request**:
```http
PUT /api/v1/users/20
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "updatedvet",
  "password": "NewSecurePass456",
  "authority": {
    "id": 4,
    "authority": "VET"
  }
}
```

**Response** (200 OK):
```json
{
  "id": 20,
  "username": "updatedvet",
  "authority": {
    "id": 4,
    "authority": "VET"
  }
}
```

**Notas**:
- Si no se proporciona password, se mantiene la actual
- Se puede cambiar el rol del usuario

### Eliminar Usuario
**Endpoint**: `DELETE /api/v1/users/{userId}`  
**Autenticación**: Requerida (Bearer Token)  
**Roles**: ADMIN

**Request**:
```http
DELETE /api/v1/users/20
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
{
  "message": "User deleted!"
}
```

**Restricciones**:
- Un administrador no puede eliminarse a sí mismo
- Si el usuario tiene relaciones (Owner, Vet), se eliminan en cascada

**Error** (403 Forbidden):
```json
{
  "message": "You can't delete yourself!"
}
```

## Gestión de Roles

### Listar Todas las Autoridades
**Endpoint**: `GET /api/v1/users/authorities`  
**Autenticación**: Requerida (Bearer Token)  
**Roles**: ADMIN

**Request**:
```http
GET /api/v1/users/authorities
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "authority": "ADMIN"
  },
  {
    "id": 2,
    "authority": "CLINIC_OWNER"
  },
  {
    "id": 3,
    "authority": "OWNER"
  },
  {
    "id": 4,
    "authority": "VET"
  }
]
```

### Descripción de Roles

| ID | Rol | Descripción | Permisos Principales |
|----|-----|-------------|---------------------|
| 1 | ADMIN | Administrador del sistema | Gestión completa de usuarios, acceso total |
| 2 | CLINIC_OWNER | Propietario de clínica | Gestión de clínicas y veterinarios |
| 3 | OWNER | Propietario de mascota | Gestión de mascotas, visitas, consultas |
| 4 | VET | Veterinario | Atención de mascotas, gestión de visitas |

## Códigos de Respuesta

### Códigos de Éxito

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 OK | Petición exitosa | GET, PUT, DELETE exitosos |
| 201 Created | Recurso creado | POST exitoso |

### Códigos de Error

| Código | Descripción | Causa Común |
|--------|-------------|-------------|
| 400 Bad Request | Petición inválida | Datos faltantes o inválidos en body |
| 401 Unauthorized | No autenticado | Token ausente, inválido o expirado |
| 403 Forbidden | No autorizado | Usuario sin permisos para la operación |
| 404 Not Found | Recurso no encontrado | ID de usuario no existe |
| 409 Conflict | Conflicto | Username ya existe |

### Estructura de Error

**Response de Error**:
```json
{
  "timestamp": "2026-02-16T18:56:16.483Z",
  "status": 403,
  "error": "Forbidden",
  "message": "You can't delete yourself!",
  "path": "/api/v1/users/1"
}
```

## Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Autenticación

```bash
# 1. Iniciar sesión como admin
curl -X POST http://localhost:8080/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "4dm1n"
  }'

# Respuesta:
# {
#   "token": "eyJhbGciOiJIUzUxMiJ9...",
#   "id": 1,
#   "username": "admin1",
#   "authority": "ADMIN"
# }

# 2. Usar el token para acceder a recursos protegidos
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### Ejemplo 2: Crear y Configurar un Nuevo Veterinario

```bash
# 1. Autenticarse como admin
TOKEN=$(curl -X POST http://localhost:8080/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"4dm1n"}' \
  | jq -r '.token')

# 2. Listar autoridades disponibles
curl -X GET http://localhost:8080/api/v1/users/authorities \
  -H "Authorization: Bearer $TOKEN"

# 3. Crear usuario VET
curl -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "vet7",
    "password": "v3t",
    "authority": {
      "id": 4,
      "authority": "VET"
    }
  }'

# 4. Verificar creación
curl -X GET http://localhost:8080/api/v1/users?auth=VET \
  -H "Authorization: Bearer $TOKEN"
```

### Ejemplo 3: Cambiar Rol de un Usuario

```bash
# Autenticarse como admin
TOKEN="<admin-token>"

# Cambiar un usuario de OWNER a VET
curl -X PUT http://localhost:8080/api/v1/users/13 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "owner10",
    "authority": {
      "id": 4,
      "authority": "VET"
    }
  }'
```

### Ejemplo 4: Registro de Nuevo Propietario

```bash
# El registro está disponible públicamente
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newowner",
    "password": "SecurePass123!",
    "authority": "OWNER",
    "firstName": "Carlos",
    "lastName": "Pérez",
    "address": "Av. Constitución 45",
    "city": "Málaga",
    "telephone": "952123456"
  }'

# Respuesta: {"message": "User registered successfully!"}

# Iniciar sesión con el nuevo usuario
curl -X POST http://localhost:8080/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newowner",
    "password": "SecurePass123!"
  }'
```

### Ejemplo 5: Gestión de Usuarios por Rol

```bash
TOKEN="<admin-token>"

# Listar todos los veterinarios
curl -X GET "http://localhost:8080/api/v1/users?auth=VET" \
  -H "Authorization: Bearer $TOKEN"

# Listar todos los propietarios de clínicas
curl -X GET "http://localhost:8080/api/v1/users?auth=CLINIC_OWNER" \
  -H "Authorization: Bearer $TOKEN"

# Listar todos los propietarios de mascotas
curl -X GET "http://localhost:8080/api/v1/users?auth=OWNER" \
  -H "Authorization: Bearer $TOKEN"

# Listar todos los administradores
curl -X GET "http://localhost:8080/api/v1/users?auth=ADMIN" \
  -H "Authorization: Bearer $TOKEN"
```

### Ejemplo 6: Validar Token JWT

```bash
# Verificar si un token es válido
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

curl -X GET "http://localhost:8080/api/v1/auth/validate?token=$TOKEN"

# Respuesta: 200 OK si válido, 401 Unauthorized si inválido
```

## Uso con Postman

### Configurar Autenticación en Postman

1. **Crear nueva Collection**: "PetClinic API"

2. **Configurar Variables de Entorno**:
   - `baseUrl`: `http://localhost:8080`
   - `token`: (se actualizará automáticamente)

3. **Configurar Autorización a nivel de Collection**:
   - Type: `Bearer Token`
   - Token: `{{token}}`

4. **Script de Pre-request para Login** (en la request de signin):
   ```javascript
   // No se necesita token para login
   ```

5. **Script de Test para Login** (en la request de signin):
   ```javascript
   // Guardar el token automáticamente
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   pm.environment.set("userId", jsonData.id);
   pm.environment.set("username", jsonData.username);
   console.log("Token guardado: " + jsonData.token);
   ```

### Requests de Ejemplo en Postman

**Collection: PetClinic API**

1. **Login**
   - Method: POST
   - URL: `{{baseUrl}}/api/v1/auth/signin`
   - Body (JSON):
     ```json
     {
       "username": "admin1",
       "password": "4dm1n"
     }
     ```

2. **List Users**
   - Method: GET
   - URL: `{{baseUrl}}/api/v1/users`
   - Auth: Inherit from parent

3. **Create User**
   - Method: POST
   - URL: `{{baseUrl}}/api/v1/users`
   - Auth: Inherit from parent
   - Body (JSON):
     ```json
     {
       "username": "newuser",
       "password": "password123",
       "authority": {"id": 3, "authority": "OWNER"}
     }
     ```

## Seguridad

### Recomendaciones

1. **Proteger el Token**:
   - No incluir tokens en URLs
   - No compartir tokens
   - Almacenar de forma segura (httpOnly cookies en producción)

2. **HTTPS en Producción**:
   - Siempre usar HTTPS para transmitir tokens
   - Los tokens en HTTP plano son vulnerables

3. **Expiración de Tokens**:
   - Los tokens expiran en 24 horas por defecto
   - Renovar token antes de expiración

4. **Contraseñas Seguras**:
   - Mínimo 8 caracteres
   - Combinación de letras, números y símbolos
   - No reutilizar contraseñas

5. **Limitar Intentos de Login**:
   - Implementar rate limiting
   - Bloquear temporalmente tras múltiples fallos

## Troubleshooting

### Token Inválido o Expirado
**Error**: `401 Unauthorized`
**Solución**: Volver a hacer login para obtener un nuevo token

### Permisos Insuficientes
**Error**: `403 Forbidden`
**Solución**: Verificar que el usuario tiene el rol necesario para la operación

### Username Ya Existe
**Error**: `409 Conflict`
**Solución**: Usar un username diferente

### Usuario No Encontrado
**Error**: `404 Not Found`
**Solución**: Verificar que el ID de usuario existe

---

**Última actualización**: 2026-02-16  
**Versión API**: v1.0
