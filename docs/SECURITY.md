# Sistema de Seguridad - CATLab PetClinic

## Índice
1. [Introducción](#introducción)
2. [Tipos de Usuarios y Roles](#tipos-de-usuarios-y-roles)
3. [Autenticación](#autenticación)
4. [Autorización y Control de Acceso](#autorización-y-control-de-acceso)
5. [Gestión de Usuarios](#gestión-de-usuarios)
6. [Configuración de Seguridad](#configuración-de-seguridad)
7. [Mejores Prácticas](#mejores-prácticas)

## Introducción

El sistema de seguridad de CATLab PetClinic está diseñado para proporcionar autenticación robusta basada en JWT (JSON Web Tokens) y control de acceso basado en roles (RBAC - Role-Based Access Control). Este documento describe la arquitectura de seguridad, los tipos de usuarios, y cómo se gestionan los permisos en el sistema.

### Características Principales
- **Autenticación sin estado (Stateless)** mediante JWT
- **4 roles de usuario** con permisos diferenciados
- **Encriptación de contraseñas** con BCrypt
- **Control de acceso granular** a nivel de endpoint
- **Gestión completa de usuarios** para administradores

## Tipos de Usuarios y Roles

El sistema define cuatro tipos de usuarios principales, cada uno con responsabilidades y permisos específicos:

### 1. ADMIN (Administrador)
**Descripción**: Administradores del sistema con acceso completo a todas las funcionalidades.

**Responsabilidades**:
- Gestión completa de usuarios (crear, modificar, eliminar)
- Acceso a todas las funcionalidades del sistema
- Visualización de estadísticas globales
- Gestión de clínicas y propietarios de clínicas
- Supervisión general del sistema

**Permisos**:
- Acceso total a `/api/v1/users/**`
- Acceso a `/api/v1/clinicOwners/all`
- Acceso a `/api/v1/owners/**`
- Eliminación de consultas (`DELETE /api/v1/consultations/**`)
- Estadísticas de mascotas y veterinarios
- Todos los permisos de otros roles

**Usuario de ejemplo**: `admin1` (contraseña: `4dm1n`)

### 2. CLINIC_OWNER (Propietario de Clínica)
**Descripción**: Propietarios y administradores de clínicas veterinarias.

**Responsabilidades**:
- Gestión de su(s) clínica(s)
- Gestión de veterinarios en sus clínicas
- Supervisión de operaciones de la clínica

**Permisos**:
- Acceso a `/api/v1/clinicOwners/**` (compartido con ADMIN)
- Acceso a `/api/v1/clinics/**` (compartido con ADMIN)
- Gestión de veterinarios `/api/v1/vets/**` (compartido con ADMIN y VET)

**Usuarios de ejemplo**: `clinicOwner1`, `clinicOwner2` (contraseña: `clinic_owner`)

### 3. VET (Veterinario)
**Descripción**: Profesionales veterinarios que brindan servicios médicos.

**Responsabilidades**:
- Atención de mascotas
- Gestión de visitas y consultas
- Actualización de información médica

**Permisos**:
- Acceso completo a `/api/v1/vets/**` (modificación de datos veterinarios)
- Acceso a consultas autenticadas
- Visualización de mascotas y visitas

**Usuarios de ejemplo**: `vet1` a `vet6` (contraseña: `v3t`)

### 4. OWNER (Propietario de Mascota)
**Descripción**: Clientes del sistema que poseen mascotas.

**Responsabilidades**:
- Gestión de sus mascotas
- Programación de visitas
- Consulta de información de sus mascotas

**Permisos**:
- Acceso al plan de suscripción (`/api/v1/plan`)
- Acceso autenticado a sus mascotas (`/api/v1/pets/**`)
- Acceso autenticado a visitas (`/api/v1/visits/**`)
- Acceso autenticado a consultas (`/api/v1/consultations/**`)

**Usuarios de ejemplo**: `owner1` a `owner10` (contraseña: `0wn3r`)

## Autenticación

### Flujo de Autenticación JWT

El sistema utiliza JSON Web Tokens (JWT) para autenticación sin estado:

```
1. Usuario envía credenciales → POST /api/v1/auth/signin
   Body: { "username": "admin1", "password": "4dm1n" }

2. Sistema valida credenciales
   - Verifica usuario existe
   - Compara contraseña hasheada con BCrypt
   
3. Si válido, genera JWT token
   - Incluye: username, roles, fecha de expiración
   - Firma con clave secreta (HS512)
   
4. Retorna respuesta con token
   {
     "token": "eyJhbGciOiJIUzUxMiJ9...",
     "id": 1,
     "username": "admin1",
     "authority": "ADMIN"
   }

5. Cliente incluye token en peticiones subsecuentes
   Header: Authorization: Bearer <token>
   
6. Filtro JWT valida token en cada petición
   - Verifica firma
   - Valida expiración
   - Extrae información del usuario
   - Configura SecurityContext
```

### Endpoints de Autenticación

#### POST /api/v1/auth/signin
Inicia sesión con usuario y contraseña.

**Request**:
```json
{
  "username": "admin1",
  "password": "4dm1n"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjEi...",
  "id": 1,
  "username": "admin1",
  "authority": "ADMIN"
}
```

#### POST /api/v1/auth/signup
Registra un nuevo usuario en el sistema.

**Request**:
```json
{
  "username": "newuser",
  "password": "securePass123",
  "authority": "OWNER",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully!"
}
```

#### GET /api/v1/auth/validate
Valida un token JWT.

**Query Parameter**: `token=<jwt_token>`

**Response** (200 OK si válido, 401 si inválido)

### Configuración de JWT

Los parámetros de JWT se configuran en `application.properties`:

```properties
# Clave secreta para firma de tokens (cambiar en producción)
petclinic.app.jwtSecret=jwtSecretKey

# Tiempo de expiración del token en milisegundos (default: 86400000 = 24 horas)
petclinic.app.jwtExpirationMs=86400000
```

## Autorización y Control de Acceso

### Matriz de Control de Acceso

| Endpoint | ADMIN | CLINIC_OWNER | VET | OWNER | Público |
|----------|-------|--------------|-----|-------|---------|
| **Autenticación** |
| `/api/v1/auth/**` | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Usuarios** |
| `GET /api/v1/users` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `POST /api/v1/users` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `PUT /api/v1/users/{id}` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `DELETE /api/v1/users/{id}` | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Clínicas** |
| `GET /api/v1/clinics` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/api/v1/clinics/**` (otros) | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Propietarios de Clínicas** |
| `GET /api/v1/clinicOwners/all` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `/api/v1/clinicOwners/**` | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Veterinarios** |
| `GET /api/v1/vets/**` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `POST/PUT/DELETE /api/v1/vets/**` | ✓ | ✓ | ✓ | ✗ | ✗ |
| `GET /api/v1/vets/stats` | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Propietarios de Mascotas** |
| `/api/v1/owners/**` | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Mascotas** |
| `GET /api/v1/pets/stats` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `/api/v1/pets/**` (otros) | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Visitas** |
| `/api/v1/visits/**` | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Consultas** |
| `DELETE /api/v1/consultations/**` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `/api/v1/consultations/**` (otros) | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Planes** |
| `GET /api/v1/plan` | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Documentación** |
| Swagger UI | ✓ | ✓ | ✓ | ✓ | ✓ |
| H2 Console (dev only) | ✓ | ✓ | ✓ | ✓ | ✓ |

✓ = Permitido | ✗ = Denegado

### Implementación de Seguridad

La configuración de seguridad se define en `SecurityConfiguration.java`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    
    @Bean
    protected SecurityFilterChain configure(HttpSecurity http) {
        http
            .cors(withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Recursos públicos
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/clinics").permitAll()
                
                // Solo ADMIN
                .requestMatchers("/api/v1/users/**").hasAuthority("ADMIN")
                .requestMatchers("/api/v1/owners/**").hasAuthority("ADMIN")
                
                // ADMIN o CLINIC_OWNER
                .requestMatchers("/api/v1/clinicOwners/**")
                    .hasAnyAuthority("ADMIN", "CLINIC_OWNER")
                
                // Autenticados
                .requestMatchers("/api/v1/pets/**").authenticated()
                
                // Denegar todo lo demás
                .anyRequest().denyAll()
            )
            .addFilterBefore(authenticationJwtTokenFilter(), 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## Gestión de Usuarios

### API de Gestión de Usuarios

**Nota**: Todos estos endpoints requieren rol **ADMIN**.

#### Listar Usuarios
```http
GET /api/v1/users
GET /api/v1/users?authority=OWNER
```

**Query Parameters**:
- `authority` (opcional): Filtrar por rol específico

**Response**:
```json
[
  {
    "id": 1,
    "username": "admin1",
    "authority": {
      "id": 1,
      "authority": "ADMIN"
    }
  }
]
```

#### Obtener Usuario por ID
```http
GET /api/v1/users/{id}
```

#### Crear Usuario
```http
POST /api/v1/users
Content-Type: application/json

{
  "username": "newuser",
  "password": "securePassword",
  "authority": {
    "id": 3,
    "authority": "OWNER"
  }
}
```

#### Actualizar Usuario
```http
PUT /api/v1/users/{userId}
Content-Type: application/json

{
  "username": "updatedUsername",
  "password": "newPassword",
  "authority": {
    "id": 2,
    "authority": "CLINIC_OWNER"
  }
}
```

#### Eliminar Usuario
```http
DELETE /api/v1/users/{userId}
```

**Restricción**: Un usuario no puede eliminarse a sí mismo.

#### Listar Autoridades/Roles
```http
GET /api/v1/users/authorities
```

**Response**:
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

### Servicios de Usuario

#### UserService
Proporciona lógica de negocio para gestión de usuarios:

- `saveUser(User user)`: Crear/actualizar usuario
- `findUser(String username)`: Buscar por nombre de usuario
- `findUser(Integer id)`: Buscar por ID
- `findCurrentUser()`: Obtener usuario autenticado actual
- `existsUser(String username)`: Verificar existencia
- `updateUser(User user, Integer id)`: Actualizar usuario
- `deleteUser(Integer id)`: Eliminar usuario y relaciones
- `findAll()`: Listar todos los usuarios
- `findAllByAuthority(String auth)`: Filtrar por rol

#### AuthoritiesService
Gestiona roles y permisos:

- `findAll()`: Listar todas las autoridades
- `findByAuthority(String authority)`: Buscar rol específico
- `saveAuthorities(Authorities authorities)`: Guardar nuevo rol

## Configuración de Seguridad

### Entidades de Seguridad

#### User Entity
```java
@Entity
@Table(name = "appusers")
public class User extends BaseEntity {
    @Column(unique = true)
    String username;
    
    String password;  // Hasheada con BCrypt
    
    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "authority")
    Authorities authority;
    
    // Métodos helper
    public Boolean hasAuthority(String auth);
    public Boolean hasAnyAuthority(String... authorities);
}
```

#### Authorities Entity
```java
@Entity
@Table(name = "authorities")
public class Authorities extends BaseEntity {
    @Column(length = 20, unique = true, nullable = false)
    String authority;
}
```

### Componentes de Seguridad

#### AuthTokenFilter
Filtro que intercepta todas las peticiones HTTP y valida tokens JWT:

1. Extrae token del header `Authorization: Bearer <token>`
2. Valida token con `JwtUtils`
3. Carga detalles del usuario
4. Configura `SecurityContext` para la petición

#### JwtUtils
Utilidad para gestión de tokens JWT:

- `generateJwtToken(Authentication auth)`: Genera token
- `getUserNameFromJwtToken(String token)`: Extrae username
- `validateJwtToken(String token)`: Valida firma y expiración

#### UserDetailsServiceImpl
Implementación de `UserDetailsService` de Spring Security:

- Carga usuarios desde la base de datos
- Convierte `User` a `UserDetails` de Spring Security

#### AuthEntryPointJwt
Maneja errores de autenticación no autorizada (401):

```java
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, 
                          "Error: Unauthorized");
    }
}
```

### Encriptación de Contraseñas

El sistema usa **BCrypt** para hashear contraseñas:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

**Características de BCrypt**:
- Algoritmo de hashing adaptativo
- Incorpora salt automáticamente
- Resistente a ataques de fuerza bruta
- Complejidad configurable

**Ejemplo de contraseña hasheada**:
```
Contraseña: 4dm1n
Hash: $2a$10$nMmTWAhPTqXqLDJTag3prumFrAJpsYtroxf0ojesFYq0k4PmcbWUS
```

## Mejores Prácticas

### Para Desarrolladores

1. **Nunca almacenar contraseñas en texto plano**
   ```java
   // ✓ CORRECTO
   user.setPassword(passwordEncoder.encode(rawPassword));
   
   // ✗ INCORRECTO
   user.setPassword(rawPassword);
   ```

2. **Validar autorización en servicios críticos**
   ```java
   @PreAuthorize("hasAuthority('ADMIN')")
   public void deleteUser(Integer id) {
       // Lógica de eliminación
   }
   ```

3. **No exponer información sensible en respuestas**
   ```java
   // ✗ INCORRECTO - Expone contraseña
   return user;
   
   // ✓ CORRECTO - Omite contraseña
   return userDTO;
   ```

4. **Usar HTTPS en producción**
   - Los tokens JWT deben transmitirse por HTTPS
   - Configurar certificados SSL/TLS

5. **Rotar secretos JWT regularmente**
   - Cambiar `petclinic.app.jwtSecret` periódicamente
   - Usar gestores de secretos (AWS Secrets Manager, Azure Key Vault)

6. **Implementar límite de intentos de login**
   - Prevenir ataques de fuerza bruta
   - Bloquear temporalmente tras N intentos fallidos

7. **Validar tokens en cada petición**
   - El filtro JWT ya lo hace automáticamente
   - Verificar expiración de tokens

8. **Logging de eventos de seguridad**
   ```java
   logger.warn("Intento de acceso no autorizado: {}", request.getRequestURI());
   ```

### Para Usuarios

1. **Contraseñas seguras**
   - Mínimo 8 caracteres
   - Combinar mayúsculas, minúsculas, números y símbolos
   - No reutilizar contraseñas

2. **Proteger tokens JWT**
   - No compartir tokens
   - No almacenar en localStorage (preferir cookies httpOnly)
   - Cerrar sesión al terminar

3. **Reportar actividad sospechosa**
   - Cambios no autorizados
   - Accesos desde ubicaciones desconocidas

## Pruebas de Seguridad

### Pruebas Recomendadas

1. **Autenticación**
   - Login exitoso con credenciales válidas
   - Login fallido con credenciales inválidas
   - Validación de token correcto
   - Rechazo de token expirado
   - Rechazo de token inválido

2. **Autorización**
   - Verificar acceso permitido para cada rol
   - Verificar denegación de acceso sin permisos
   - Probar escalación de privilegios (debe fallar)

3. **Gestión de Usuarios**
   - CRUD completo de usuarios
   - Validación de unicidad de username
   - Prevención de auto-eliminación
   - Cambio de roles

### Ejemplo de Test
```java
@Test
@WithMockUser(username = "admin1", authorities = "ADMIN")
void testAdminCanAccessUsers() throws Exception {
    mockMvc.perform(get("/api/v1/users"))
        .andExpect(status().isOk());
}

@Test
@WithMockUser(username = "owner1", authorities = "OWNER")
void testOwnerCannotAccessUsers() throws Exception {
    mockMvc.perform(get("/api/v1/users"))
        .andExpect(status().isForbidden());
}
```

## Contacto y Soporte

Para preguntas o problemas relacionados con seguridad:
- Reportar vulnerabilidades de forma privada al equipo de desarrollo
- No publicar problemas de seguridad en issue trackers públicos

---

**Última actualización**: 2026-02-16  
**Versión**: 1.0
