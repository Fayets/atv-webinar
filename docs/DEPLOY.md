# Deploy en el VPS — atvos.io/acceso

La landing reemplaza a `atv-landing` en `atvos.io/acceso`. Toma **los mismos puertos**
(8005 backend, 8085 frontend), así que **el nginx del host no se toca**: solo se baja un
contenedor y se levanta el otro.

## Antes de empezar

Dos datos tienen que estar cargados o la landing sale rota:

| Variable | Qué es |
|---|---|
| `WHATSAPP_GROUP_URL` | link de invitación real al grupo. Sin esto el botón devuelve 503 |
| `WEBINAR_STARTS_AT` | fecha real del webinar, ISO con offset (`2026-10-02T19:00:00-03:00`) |

## 0. Verificar quién tiene los puertos

En el repo, `atv-landing` y `atv-landing2` declaran los mismos 8005/8085. Antes de tocar
nada hay que confirmar cuál está realmente en `/acceso`:

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Tiene que aparecer `atv-landing-frontend` con `0.0.0.0:8085->80/tcp`. Si el 8085 lo tiene
otro contenedor, avisar antes de seguir.

## 1. Subir el repo

Desde la Mac, en `~/Desktop/LandingWebinar`:

```bash
git init && git add . && git commit -m "Landing webinar: quiz, grupo de WhatsApp, agenda y dashboard"
```

Después crear el repo en GitHub (`Fayets/atv-webinar`) y:

```bash
git remote add origin https://github.com/Fayets/atv-webinar.git && git branch -M master && git push -u origin master
```

## 2. Clonar en el VPS

```bash
cd /opt && git clone https://github.com/Fayets/atv-webinar.git atv-webinar
```

## 3. Crear el .env del backend

Las credenciales de Neon y el `SECRET` se copian del `.env` de la landing vieja
(`/opt/atv-landing/backend/.env`). El `SECRET` tiene que ser **el mismo** de
atv-ecosystem: es lo que valida la cookie `ecosystem_session`.

```bash
cd /opt/atv-webinar/backend && cp /opt/atv-landing/backend/.env .env.vieja && nano .env
```

Contenido:

```
DB_PROVIDER=postgres
DB_SCHEMA=webinar
DB_HOST=<el de .env.vieja>
DB_PORT=5432
DB_NAME=<el de .env.vieja>
DB_USER=<el de .env.vieja>
DB_PASSWORD=<el de .env.vieja>
DB_SSLMODE=require

SECRET=<el mismo de atv-ecosystem>

FRONTEND_ORIGIN=https://atvos.io

VSL_URL=https://vimeo.com/1210850489
VSL_VIMEO_ID=1210850489

WHATSAPP_GROUP_URL=<link real del grupo>

WEBINAR_TITLE=Webinar · Sistema de equipo A-players
WEBINAR_STARTS_AT=<fecha real, ISO con offset>
WEBINAR_DURATION_MIN=90
WEBINAR_DETAILS=Cómo instalar el sistema de equipo A-players detrás de $200k/mes.
WEBINAR_URL=https://atvos.io/acceso
```

`DB_SCHEMA=webinar` es a propósito: la landing vieja usa otro esquema, así que sus
registrados quedan intactos. El esquema nuevo se crea solo al arrancar.

Borrar la copia cuando termines: `rm .env.vieja`

## 4. El cambio

Los dos comandos van juntos: el segundo no puede arrancar hasta que el primero libere
los puertos.

```bash
cd /opt/atv-landing && docker compose down && cd /opt/atv-webinar && docker compose up -d --build
```

## 5. Comprobar

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://atvos.io/acceso/
curl -s https://atvos.io/acceso/api/webinar/
curl -s https://atvos.io/acceso/api/auth/mode
```

El último tiene que devolver `{"mode":"session"}`. Si dice `pin`, falta el `SECRET`.

Después, en el browser: `atvos.io/acceso` (landing), completar el opt-in hasta
`atvos.io/acceso/ty-page`, y `atvos.io/acceso/dashboard` (tiene que entrar con tu usuario
del ecosistema, sin pedir PIN).

## Volver atrás

```bash
cd /opt/atv-webinar && docker compose down && cd /opt/atv-landing && docker compose up -d
```

Los registros que hayan entrado en el esquema `webinar` quedan guardados en Neon.

## Actualizaciones

```bash
cd /opt/atv-webinar && git pull origin master && docker compose up -d --build
```

El `--build` no es opcional: el Dockerfile hace `COPY . .`, así que un `restart` levanta
la versión vieja.
