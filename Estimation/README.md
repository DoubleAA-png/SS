# StudyHub

## Deploy on Render

1. Push this project to a GitHub repository. Do not add your Gemini key to the repository.
2. In Render, choose **New + → Blueprint**, select the repository, and apply the `render.yaml` blueprint.
3. In the Render service's **Environment** settings, set `GEMINI_API_KEY` to a newly created Gemini API key. Save the change and redeploy.
4. Open the public `onrender.com` URL. The Notes page should show **Gemini ready**; visitors do not need their own key.

The Gemini key stays on the server. All visitors share its Gemini quota and any associated costs. The app limits each detected client IP to 12 organize requests per minute, but this is only a basic safeguard—not authentication or a full abuse-prevention system. Set suitable API quotas and billing alerts in Google AI Studio/Google Cloud, monitor usage, and rotate the key if it is exposed. Never put the key in frontend code or a public repository.

## Run locally

Set `GEMINI_API_KEY` in the server process environment, then run:

```powershell
python server.py
```

Open `http://127.0.0.1:8000`.
