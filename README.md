# 🧬 Biometric Architecture Demo

Proyecto integrador que implementa una **arquitectura biométrica distribuida** usando reconocimiento facial en el frontend, una API en .NET Core, persistencia en PostgreSQL y servicios de infraestructura con Docker (RabbitMQ, MinIO, Redis y Kong API Gateway).

Este repositorio demuestra conceptos de:

* Arquitectura de microservicios
* Comunicación asincrónica
* Almacenamiento de datos biométricos
* Contenerización con Docker
* API Gateway
* Reconocimiento facial en navegador

---

## 🏗️ Arquitectura General

```
[Frontend - React + Vite]
        |
        v
[Kong API Gateway :8000]
        |
        v
[Core API - .NET 9 :5042]
        |
        v
[PostgreSQL]

Servicios de apoyo:
- RabbitMQ → Mensajería asincrónica
- MinIO → Almacenamiento de imágenes biométricas
- Redis → Cache / soporte futuro
```

---

## 📂 Estructura del Proyecto

```
biometric-architecture/
│
├── core-api/         # API principal (.NET Core + EF + PostgreSQL)
├── frontend/        # Interfaz web (React + Vite + Face API)
├── infra/           # Docker + Kong + servicios de infraestructura
├── worker/          # Servicio futuro para procesamiento asincrónico
├── biometric-architecture.sln
├── .gitignore
└── README.md
```

---

## 🚀 Stack Tecnológico

| Componente     | Tecnología                               |
| -------------- | ---------------------------------------- |
| Frontend       | React + Vite + Face API.js               |
| Backend        | .NET 9 + ASP.NET Core + Entity Framework |
| Base de datos  | PostgreSQL 16                            |
| Mensajería     | RabbitMQ                                 |
| Almacenamiento | MinIO (S3 compatible)                    |
| Cache          | Redis                                    |
| Gateway        | Kong                                     |
| Contenedores   | Docker + Docker Compose                  |

---

## 🐳 Servicios Docker

Todos los servicios se levantan desde el archivo:

```
infra/docker-compose.yml
```

### Servicios incluidos

| Servicio      | Puerto | Función                     |
| ------------- | ------ | --------------------------- |
| PostgreSQL    | 5432   | Base de datos biométrica    |
| Redis         | 6379   | Cache / soporte de sesiones |
| RabbitMQ      | 5672   | Mensajería                  |
| RabbitMQ UI   | 15672  | Consola web                 |
| MinIO API     | 9000   | Almacenamiento S3           |
| MinIO Console | 9001   | Consola web                 |
| Kong Gateway  | 8000   | Entrada pública             |
| Kong Admin    | 8001   | Administración              |

---

## ▶️ Cómo levantar el sistema

### 1️⃣ Infraestructura

Desde la carpeta `infra`:

```bash
docker compose up --build
```

Verifica contenedores:

```bash
docker ps
```

---

### 2️⃣ API Core

Desde `core-api/Biometric.CoreApi`:

```bash
dotnet run
```

Swagger disponible en:

```
http://localhost:5042/swagger
```

---

### 3️⃣ Frontend

Desde `frontend`:

```bash
npm install
npm run dev
```

Frontend:

```
http://localhost:5173
```

---

## 🧠 Flujo Biométrico

### Enroll (Registro Facial)

1. Usuario abre el frontend
2. Cámara captura rostro
3. Face API genera un **descriptor facial (128 valores float)**
4. Frontend envía datos a Kong
5. Kong redirige a Core API
6. Core API guarda:

   * Datos personales
   * Descriptor biométrico
   * Imagen (opcional en MinIO)

### Verify (Futuro)

1. Usuario se autentica
2. Se genera nuevo descriptor
3. Worker compara con los almacenados
4. Resultado enviado vía RabbitMQ

---

## 🐰 RabbitMQ - Cómo funciona

RabbitMQ permite comunicación asincrónica entre servicios.

### Uso en esta arquitectura

Se utiliza para:

* Procesar verificación biométrica en segundo plano
* Registrar eventos de auditoría
* Desacoplar la API del procesamiento pesado

### Consola Web

Accede en:

```
http://localhost:15672
```

Credenciales:

```
Usuario: bio
Password: bio123
```

### Flujo de Mensajes

```
Core API → Cola RabbitMQ → Worker → Resultado
```

---

## 🪣 MinIO - Almacenamiento Biométrico

MinIO actúa como un **servidor S3 local** para guardar:

* Fotos faciales
* Evidencias biométricas
* Logs multimedia

### Consola Web

```
http://localhost:9001
```

Credenciales:

```
Usuario: bio
Password: bio12345
```

### Uso típico

1. Crear bucket: `biometric-photos`
2. Core API sube imágenes
3. Worker puede leerlas para verificación

---

## 🌐 Kong API Gateway

Kong actúa como puerta de entrada al sistema.

### Funciones

* Redirección de rutas
* Seguridad
* Rate limiting
* Logging

### Flujo

```
Frontend → Kong (:8000) → Core API (:5042)
```

### Archivo Declarativo

```
infra/kong.yml
```

---

## 🧪 Probar API Manualmente (Swagger)

### GET Usuarios

```
GET http://localhost:5042/api/Users
```

### POST Enroll

Ejemplo JSON:

```json
{
  "fullName": "Roberto Dev",
  "documentId": "0102030405",
  "role": "Admin",
  "descriptor": [0.01, 0.02, 0.03, ... 1.28]
}
```

---

## 🗃️ Base de Datos

### Conectarse a PostgreSQL

```bash
docker exec -it bio_postgres psql -U bio -d biometrics
```

### Ver tablas

```sql
\dt
```

---

## 📊 Evidencia de Arquitectura

Este proyecto demuestra:

* Separación de responsabilidades
* Escalabilidad por microservicios
* Mensajería asincrónica
* Persistencia estructurada
* Gateway como punto de control
* Infraestructura reproducible con Docker

---

## 👨‍💻 Autor

**Roberto Dev**
Estudiante de Ingeniería en Software
Proyecto Integrador - Arquitectura de Sistemas Biométricos

---

## ⭐ Comandos Rápidos

| Acción         | Comando                     |
| -------------- | --------------------------- |
| Levantar infra | `docker compose up --build` |
| Apagar infra   | `docker compose down`       |
| API            | `dotnet run`                |
| Frontend       | `npm run dev`               |
| Ver logs       | `docker logs bio_postgres`  |

---

## 🎯 Nota Final

Este sistema está diseñado para escalar hacia un entorno real, permitiendo agregar:

* Autenticación JWT
* Balanceo de carga
* Workers distribuidos
* Almacenamiento en la nube

---

