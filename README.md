# Shoulder Surfing Protection System

This is a college-level demo project that demonstrates dynamic UI techniques to reduce shoulder surfing risk during login.

Features
- Dark neon-themed UI with on-screen keyboard (no physical typing allowed)
- Keys shuffle each load
- Fake cursor and key highlight decoys
- Blur/hide password when tab switch, window blur, or sudden mouse movement
- Backend with Node.js + Express, bcrypt hashed passwords, session-based auth
- Security logs of suspicious events displayed in dashboard

How it prevents shoulder surfing
- On-screen random keyboard: an observer cannot rely on keyboard positions because keys shuffle every page load.
- Bullets-only display hides typed characters.
- Fake cursor and key highlights act as decoys to distract watchers.
- Auto-blur on tab switch, window blur, or fast mouse movement prevents accidental exposure when focus changes.

Running the project
1. Install dependencies:

```bash
npm install
```

2. Start server:

```bash
npm start
```

3. Open `http://localhost:3000` in your browser. Demo credentials:
- username: `student`
- password: `P@ssw0rd123`

Viva / Presentation points
- Explain how keys are shuffled and why it prevents observation-based attacks.
- Discuss tradeoffs: usability vs security (slower input, accessibility concerns).
- Explain how server-side hashing with bcrypt is important — even if client UI is abused, password storage is secure.
- Mention enhancements: webcam face direction detection, AI-based behavior analysis to flag suspicious interactions.

Future scope (not implemented fully)
- Webcam face direction detection: use WebRTC to capture frames and analyze head pose to detect if someone else is looking at the screen.
- AI-based behavior analysis: track input patterns, timing, and mouse behavior and feed to a model that rates the risk of shoulder-surfing or coerced input.

Project Structure

```
project-root
 ├── public
 │   ├── index.html
 │   ├── dashboard.html
 │   ├── css
 │   │   └── styles.css
 │   └── js
 │       ├── login.js
 │       └── dashboard.js
 ├── server.js
 ├── package.json
 └── README.md
```

Notes
- This demo uses in-memory storage for simplicity. For production, use a persistent DB (MongoDB) and secure session store.
- Replace session secret with environment variable in production.
