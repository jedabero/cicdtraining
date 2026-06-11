# Laboratorio técnico - Pipeline CI/CD con GitHub Actions y Jenkins

## 1. Descripción de la aplicación

Este repositorio contiene una aplicación web/API desarrollada con [NestJS](https://nestjs.com/), TypeScript, Node.js 24 y pnpm. La aplicación sirve como base para la Actividad 3 de Fundamentos de DevOps, enfocada en la construcción de pipelines CI/CD con GitHub Actions, Jenkins y Docker.

Repositorio en GitHub:

- `https://github.com/jedabero/cicdtraining`

La aplicación expone los siguientes endpoints:

- `/`: endpoint principal que responde `Hello World!`.
- `/health`: endpoint de salud que responde `{ "status": "ok" }`.

La aplicación desplegada en Google Cloud Run está disponible en:

- `https://cicdtraining-523244991698.southamerica-east1.run.app`
- `https://cicdtraining-523244991698.southamerica-east1.run.app/health`

## 2. Tecnologías utilizadas

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
- Workload Identity Federation

## 3. Pipeline CI con GitHub Actions

El pipeline de integración continua está definido en `.github/workflows/ci.yml`.

Este workflow se ejecuta automáticamente ante eventos `push` y `pull_request` sobre la rama `main`.

El pipeline incluye los siguientes pasos:

- Checkout del código con `actions/checkout`.
- Configuración de Node.js 24 con `actions/setup-node`.
- Activación de Corepack para usar pnpm.
- Instalación de dependencias con `pnpm install --frozen-lockfile`.
- Ejecución de pruebas unitarias con `pnpm test`.
- Ejecución de pruebas end-to-end con `pnpm test:e2e`.
- Compilación de la aplicación con `pnpm build`.

Este pipeline valida de forma temprana que el código compile correctamente y que las pruebas existentes pasen antes de integrar cambios en la rama principal.

## 4. Pipeline CD con GitHub Actions hacia Cloud Run

El pipeline de despliegue continuo está definido en `.github/workflows/cd.yml`.

Este workflow se ejecuta automáticamente ante cada `push` sobre la rama `main` y representa el CD funcional usado en la práctica.

El pipeline incluye los siguientes pasos:

- Checkout del código con `actions/checkout`.
- Autenticación con Google Cloud mediante Workload Identity Federation.
- Configuración de `gcloud`.
- Configuración de Docker para Google Artifact Registry.
- Build de la imagen Docker usando el `Dockerfile` del repositorio.
- Push de la imagen a Google Artifact Registry.
- Deploy de la imagen en Google Cloud Run.

Configuración actual del despliegue:

- Región: `southamerica-east1`
- Servicio Cloud Run: `cicdtraining`
- Imagen: `southamerica-east1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/cicdtrainingrepo/cicdtraining`

El workflow usa los secretos configurados en GitHub para el proyecto GCP y Workload Identity Federation. No se almacenan credenciales sensibles en el repositorio.

## 5. Pipeline CD con Jenkins

El pipeline de Jenkins está definido en el archivo `Jenkinsfile` ubicado en la raíz del repositorio.

Según la guía de la actividad, no es indispensable que Jenkins esté funcionando. Lo requerido para el entregable es contar con la definición de stages del pipeline.

El `Jenkinsfile` contiene stages para:

- Checkout del repositorio.
- Verificación de Node.js y habilitación de Corepack.
- Instalación de dependencias con `pnpm install --frozen-lockfile`.
- Ejecución de pruebas unitarias con `pnpm test`.
- Ejecución de pruebas end-to-end con `pnpm test:e2e`.
- Build de la aplicación con `pnpm build`.
- Build de imagen Docker.
- Autenticación con Google Cloud.
- Publicación de imagen en Google Artifact Registry.
- Stage de despliegue futuro.

El `Jenkinsfile` sigue la misma estrategia general del workflow CD de GitHub Actions: construir una imagen Docker y publicarla en Google Artifact Registry usando la región `southamerica-east1`, el repositorio `cicdtrainingrepo` y la imagen `cicdtraining`.

Para ejecutar Jenkins de forma real, se deben configurar estas credenciales en Jenkins:

- `gcp-project-id`: credencial tipo texto con el ID del proyecto GCP.
- `gcp-service-account-key`: credencial tipo archivo con una llave JSON de una cuenta de servicio autorizada para Artifact Registry y Cloud Run.

El stage final queda como despliegue futuro para cumplir el alcance de la guía sin exigir una instancia Jenkins funcional.

## 6. Archivos principales del entregable

- Código fuente NestJS en `src/`.
- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`
- `Dockerfile`
- `Jenkinsfile`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- Pruebas unitarias y e2e en `src/*.spec.ts` y `test/`.

## 7. Evidencias

No se incluyen capturas falsas en este repositorio. Las evidencias deben agregarse manualmente después de ejecutar los pipelines y validar el despliegue.

Capturas o enlaces requeridos:

- Repositorio en GitHub.
- Workflow CI ejecutado correctamente.
- Workflow CD ejecutado correctamente.
- Imagen publicada en Google Artifact Registry.
- Servicio desplegado en Google Cloud Run.
- Endpoint `/health` funcionando en Cloud Run.
- `Jenkinsfile` con stages definidos.
- Jenkins ejecutado, solo si se decide probarlo.

También existe una guía de evidencias en `docs/evidencias/README.md`.

## 8. Ejecución local

Requisitos:

- Node.js `>=24`
- pnpm `>=10`
- Docker, si se desea construir o ejecutar la imagen localmente

Comandos principales:

```bash
corepack enable
pnpm install
pnpm test
pnpm test:e2e
pnpm build
pnpm start
```

Ejecución en modo desarrollo con recarga automática:

```bash
pnpm start:dev
```

Ejecución con Docker:

```bash
docker build -t cicdtraining .
docker run --rm -p 3000:3000 cicdtraining
```

La aplicación local quedará disponible en:

- `http://localhost:3000`
- `http://localhost:3000/health`

## 9. Conclusiones

La implementación de CI/CD mejora la automatización del ciclo de desarrollo porque permite validar el código, ejecutar pruebas, construir artefactos y desplegar de forma repetible.

El pipeline CI con GitHub Actions permite detectar errores de manera temprana antes de integrar cambios en `main`. El pipeline CD con GitHub Actions automatiza la publicación de imágenes Docker y el despliegue en Google Cloud Run, aumentando la trazabilidad de cada versión entregada.

El `Jenkinsfile` complementa el entregable al documentar una alternativa de pipeline CD con stages claros para dependencias, pruebas, build, Docker build, publicación de imagen y despliegue futuro. En conjunto, estas prácticas reducen errores manuales y fortalecen la calidad del proceso de entrega.
