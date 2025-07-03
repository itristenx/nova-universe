npx concurrently -k -n api,admin,activate,slack `
  "node cueit-backend/index.js" `
  "npm --prefix cueit-admin run dev" `
  "npm --prefix cueit-activate run dev" `
  "node cueit-slack/index.js"

