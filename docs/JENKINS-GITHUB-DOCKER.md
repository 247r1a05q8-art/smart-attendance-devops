# GitHub → Jenkins → Docker CI/CD setup

This project is configured so that a commit pushed to GitHub can trigger Jenkins to test the application, build a Docker image, and (on `main`) replace the running Docker container.

## Pipeline

1. Edit the project locally.
2. Commit and push the changes to GitHub (`main` for deployment).
3. GitHub notifies Jenkins through a webhook.
4. Jenkins checks out the latest commit, installs Node dependencies, runs `npm test`, and builds the Docker image.
5. If the branch is `main` and tests/build pass, Jenkins replaces the `smart-attendance` container.
6. Jenkins checks `http://localhost:10000/health` before marking the pipeline successful.

**Important:** saving a file does not push it to GitHub by itself. You must commit and push, unless you separately configure an auto-commit/push tool. Avoid auto-pushing every keystroke; commit a tested change instead.

## 1. Requirements on the Jenkins agent

Install/configure:
- Git
- Java supported by your Jenkins version
- Jenkins
- Node.js 20+ and npm
- Docker Engine/Desktop, running
- `curl`

The Jenkins agent user must be allowed to run Docker commands. On Linux, this commonly means granting that user Docker socket access and restarting the agent session. This is powerful access; only trusted Jenkins jobs should receive it.

This Jenkinsfile uses Windows `bat` and `powershell` steps, suitable for a Jenkins agent running on Windows with Docker Desktop enabled. If your Jenkins agent is Linux, change these steps to `sh` commands or use a Windows agent.

## 2. Create the Jenkins pipeline

1. Push this repository to GitHub.
2. In Jenkins, install the **Pipeline** and **GitHub** plugins (and Git plugin if not already installed).
3. Select **New Item → Pipeline**.
4. Under **Build Triggers**, enable **GitHub hook trigger for GITScm polling**.
5. Under **Pipeline**, choose **Pipeline script from SCM**.
6. SCM: **Git**; Repository URL: `https://github.com/247r1a05q8-art/smart-attendance-devops.git`.
7. Select the branch `*/main`; Script Path: `Jenkinsfile`; save.
8. Click **Build Now** once to verify Jenkins, Node, Docker, and permissions are configured.

If your repository is private, add a GitHub credential in Jenkins and select it in the SCM configuration. Never put a token or password in the Jenkinsfile.

## 3. Configure the GitHub webhook

1. Open the repository on GitHub → **Settings → Webhooks → Add webhook**.
2. Payload URL: `https://YOUR-REACHABLE-JENKINS-HOST/github-webhook/` (keep the trailing slash).
3. Content type: `application/json`.
4. Select **Just the push event** (pull-request events are optional).
5. Add the webhook and inspect **Recent Deliveries** after a push.

GitHub must be able to reach Jenkins. `http://localhost:8080` on your own computer is not reachable by GitHub. Use a properly secured public Jenkins URL or a secure tunnel for a lab demo. Do not expose an unsecured Jenkins instance to the internet.

If you cannot expose Jenkins, enable **Poll SCM** in Jenkins as an alternative. For example, use `H/2 * * * *` to check GitHub roughly every two minutes; this is polling, not an instant webhook.

## 4. Commit and push changes

From the project folder in PowerShell or Git Bash:

```bash
git status
git add .
git commit -m "Update attendance dashboard"
git push origin main
```

The push triggers the webhook; Jenkins runs the pipeline. If working on a feature branch, push it and open a pull request. The pipeline tests/builds it, but deploys only when the branch is `main`.

## 5. Verify Docker deployment

On the Docker host used by the Jenkins agent:

```bash
docker ps
docker images smart-attendance
docker logs smart-attendance
curl http://localhost:10000/health
```

Open `http://localhost:10000` on that host. From another computer, use the host's reachable IP/domain and ensure port `10000` is allowed by the firewall.

## Notes

- This pipeline deploys the root Node/Express application defined by the repository's root `Dockerfile` and `server.js`.
- The `backend/` and `frontend/` directories are a separate multi-container setup. This Jenkinsfile intentionally builds the root application to match the repository's root `README.md` and health endpoint. If you want the React frontend + API + PostgreSQL stack deployed instead, the pipeline should use Docker Compose and its production environment variables.
- Deployment uses a local Docker image and container; it does not push the image to Docker Hub. A remote server deployment requires SSH/credentials and a target Docker host.
