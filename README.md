# Laboratorio tecnico - Pipeline CI/CD con GitHub Actions y Jenkins

## 1. Descripcion de la aplicacion

Esta aplicacion es un proyecto web/API desarrollado con [NestJS](https://nestjs.com/), un framework progresivo de Node.js para construir aplicaciones server-side eficientes y escalables.

El objetivo del repositorio es servir como base para un laboratorio tecnico de CI/CD, integrando automatizacion con GitHub Actions, Jenkins y Docker.

La aplicacion expone un servicio HTTP basico y se ejecuta por defecto en el puerto `3000`.

## 2. Tecnologias utilizadas

- GitHub
- GitHub Actions
- Jenkins
- Docker
- Node.js 24
- pnpm
- NestJS
- TypeScript
- Jest
- Google Cloud Run
- Google Artifact Registry

## 3. Pipeline CI/CD con GitHub Actions

El workflow de GitHub Actions se encuentra en `.github/workflows/deploy.yml`.

Actualmente se ejecuta cuando hay un `push` a la rama `main`. Este pipeline esta orientado a despliegue continuo hacia Google Cloud Run.

Stages principales:

- Checkout del repositorio con `actions/checkout`.
- Autenticacion con Google Cloud usando Workload Identity Federation.
- Configuracion de `gcloud`.
- Configuracion de Docker para publicar imagenes en Artifact Registry.
- Build de la imagen Docker usando el `Dockerfile` del repositorio.
- Publicacion de la imagen Docker en Google Artifact Registry.
- Despliegue de la imagen en Google Cloud Run.

Para que el workflow funcione correctamente, el repositorio debe tener configurados estos secretos:

- `GCP_PROJECT_ID`
- `WIF_PROVIDER`
- `WIF_SERVICE_ACCOUNT`

Nota: el enunciado del laboratorio contempla un pipeline CI en `push` y `pull_request` con instalacion de dependencias, pruebas y build. En este repositorio, el workflow actual esta enfocado en CD sobre `main`. Si se desea separar CI y CD, se puede agregar otro workflow para ejecutar `pnpm install`, `pnpm run test` y `pnpm run build` en cada push o pull request.

## 4. Pipeline CD con Jenkins

El repositorio incluye un archivo `Jenkinsfile` en la raiz. Actualmente el archivo existe, pero todavia no tiene stages definidos.

Para este laboratorio, el `Jenkinsfile` deberia definir un pipeline con los siguientes stages:

- Checkout del codigo fuente.
- Instalacion de dependencias con `pnpm install --frozen-lockfile`.
- Ejecucion de pruebas con `pnpm run test`.
- Build de la aplicacion con `pnpm run build`.
- Build de la imagen Docker.
- Publicacion de la imagen en un registro de contenedores.
- Stage de despliegue futuro.

Este pipeline permitiria complementar GitHub Actions con una alternativa de automatizacion basada en Jenkins.

## 5. Evidencias

Agregar capturas o enlaces de evidencia del laboratorio:

- Ejecucion correcta del workflow de GitHub Actions.
- Archivo `Jenkinsfile` presente en el repositorio.
- Si se ejecuta Jenkins, captura del pipeline o de la consola de ejecucion.
- Imagen Docker publicada en el registro, si aplica.
- Servicio desplegado en Cloud Run, si aplica.

## 6. Como ejecutar localmente

### Requisitos

- Node.js `>=24`
- pnpm `>=10`
- Docker, si se desea construir o ejecutar la imagen localmente

El repositorio define la version de Node.js en `.nvmrc` y `.node-version`, y el package manager en `package.json` mediante `packageManager`.

### Instalar dependencias

```bash
corepack enable
pnpm install
```

### Ejecutar en desarrollo

```bash
pnpm run start
```

Modo watch:

```bash
pnpm run start:dev
```

### Ejecutar pruebas

Pruebas unitarias:

```bash
pnpm run test
```

Pruebas end-to-end:

```bash
pnpm run test:e2e
```

Cobertura:

```bash
pnpm run test:cov
```

### Compilar y ejecutar en modo produccion

```bash
pnpm run build
pnpm run start:prod
```

### Construir y ejecutar con Docker

```bash
docker build -t cicdtraining .
docker run --rm -p 3000:3000 cicdtraining
```

La aplicacion quedara disponible en `http://localhost:3000`.

## 7. Conclusiones

La integracion de CI/CD mejora la automatizacion del ciclo de desarrollo porque permite ejecutar validaciones, construir artefactos y desplegar aplicaciones de forma repetible.

GitHub Actions facilita la integracion directa con el repositorio y, en este proyecto, automatiza la construccion, publicacion y despliegue de la imagen Docker en Google Cloud Run.

Jenkins permite definir pipelines flexibles para instalacion de dependencias, pruebas, build, publicacion de imagenes y futuras etapas de despliegue.

En conjunto, estas herramientas mejoran la calidad, reducen errores manuales y aumentan la trazabilidad de cada cambio entregado.
