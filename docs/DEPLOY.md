# Deploy en el VPS — join.atvos.io

La landing vive en la raíz de **join.atvos.io** (registro A `join` → `72.60.244.220`,
el VPS de Hostinger).
Los contenedores siguen en **8005** (backend) y **8085** (frontend); el nginx del host
pone el dominio y el certificado adelante.

## Antes de empezar

Dos datos tienen que estar cargados o la landing sale rota:

| Variable | Qué es |
|---|---|
| `WHATSAPP_GROUP_URL` | link de invitación real al grupo. Sin esto el botón devuelve 503 |
| `WEBINAR_STARTS_AT` | fecha real del webinar, ISO con offset (`2026-10-02T19:00:00-03:00`) |

## 0. Verificar quién tiene los puertos

En el repo, `atv-landing` y `atv-landing2` declaran los mismos 8005/8085. Antes de tocar
nada hay que confirmar cuál tiene hoy el 8085:

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

FRONTEND_ORIGIN=https://join.atvos.io

WHATSAPP_GROUP_URL=<link real del grupo>

WEBINAR_TITLE=Evento en vivo · Aumenta Tu Valor
WEBINAR_STARTS_AT=<fecha real, ISO con offset>
WEBINAR_DURATION_MIN=90
WEBINAR_DETAILS=<datos del Zoom>
WEBINAR_URL=https://join.atvos.io
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

## 5. Dominio: nginx del host + certificado

El registro DNS ya está (`join` → `72.60.244.220`). Crear el server block:

```bash
nano /etc/nginx/sites-available/join.atvos.io
```

```nginx
server {
    listen 80;
    server_name join.atvos.io;

    location / {
        proxy_pass http://127.0.0.1:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/join.atvos.io /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx && certbot --nginx -d join.atvos.io
```

## 6. Sacar /acceso de atvos.io

La landing ya no vive en `atvos.io/acceso` y no queda redirección: todo pasa a
`join.atvos.io`. En el server block de `atvos.io`, borrar el `location /acceso` (y
cualquier `location /acceso/...`) que hace proxy al 8085:

```bash
grep -rn "acceso" /etc/nginx/sites-enabled/
```

```bash
nginx -t && systemctl reload nginx
```

## 7. Comprobar

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://join.atvos.io/
curl -s https://join.atvos.io/api/webinar/
curl -s https://join.atvos.io/api/auth/mode
curl -s -o /dev/null -w '%{http_code}\n' https://atvos.io/acceso/
```

El tercero tiene que devolver `{"mode":"session"}`. Si dice `pin`, falta el `SECRET`.
El último ya no tiene que llegar a la landing (lo que responda `atvos.io` para una ruta que no existe).

Después, en el browser: `join.atvos.io` (landing), completar el opt-in hasta
`join.atvos.io/ty-page`, y `join.atvos.io/dashboard` (tiene que entrar con tu usuario
del ecosistema, sin pedir PIN).

Fuera de este repo: el tile **ATV LANDING** de atv-ecosystem tiene que apuntar a
`https://join.atvos.io/dashboard`, igual que los anuncios a `https://join.atvos.io/`.

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
