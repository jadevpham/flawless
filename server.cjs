// server.cjs
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Fake token map (token → userId)
const tokenMap = {};

// POST /api/auth/login
server.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const db = router.db; // lowdb instance
  const user = db
    .get("users")
    .find({ username, password })
    .value();

  if (user) {
    const token = "fake-token-user-" + user.id; // simple fake token
    const refreshToken = "fake-refresh-token-user-" + user.id + "-" + Date.now();
    tokenMap[token] = user.id;
    refreshTokenMap[refreshToken] = user.id;
    res.jsonp({
      token: token,
      user: {
        userId: user.id,
        username: user.username,
        role: user.role,
        artistId: user.artistId
      }
    });
  } else {
    res.status(401).jsonp({ error: "Invalid username or password" });
  }
});

// GET /api/auth/me
server.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).jsonp({ error: "No token provided" });
  }

  const token = authHeader.substring(7); // remove "Bearer "
  const userId = tokenMap[token];

  if (!userId) {
    return res.status(401).jsonp({ error: "Invalid token" });
  }

  const db = router.db;
  const user = db.get("users").find({ id: userId }).value();

  if (!user) {
    return res.status(404).jsonp({ error: "User not found" });
  }

  res.jsonp({
    userId: user.id,
    username: user.username,
    role: user.role,
    artistId: user.artistId
  });
});

// Custom /customers with role-based filtering
server.get("/customers", (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).jsonp({ error: "No token provided" });
  }

  const token = authHeader.substring(7);
  const userId = tokenMap[token];

  if (!userId) {
    return res.status(401).jsonp({ error: "Invalid token" });
  }

  const db = router.db;
  const user = db.get("users").find({ id: userId }).value();

  if (!user) {
    return res.status(404).jsonp({ error: "User not found" });
  }

  let customers = db.get("customers").value();

  if (user.role === "artist") {
    customers = customers.filter(c => c.artistId === user.artistId);
  }

  res.jsonp(customers);
});

// === Add refresh token API ===
const refreshTokenMap = {};

server.post("/refreshTokens", (req, res) => {
  const { refreshToken, userId } = req.body;

  if (!refreshToken || !userId) {
    return res.status(400).jsonp({ error: "Missing refreshToken or userId" });
  }

  refreshTokenMap[refreshToken] = userId;

  console.log("Saved refreshToken:", refreshToken);

  res.jsonp({ success: true });
});

server.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;

  const userId = refreshTokenMap[refreshToken];

  if (!userId) {
    return res.status(401).jsonp({ error: "Invalid refreshToken" });
  }

  const db = router.db;
  const user = db.get("users").find({ id: userId }).value();

  if (!user) {
    return res.status(404).jsonp({ error: "User not found" });
  }

  const newAccessToken = "fake-token-user-" + user.id;
  tokenMap[newAccessToken] = user.id;

  res.jsonp({
    token: newAccessToken,
    user: {
      userId: user.id,
      username: user.username,
      role: user.role,
      artistId: user.artistId
    }
  });
});

// Default router
server.use(router);

server.listen(3002, () => {
  console.log("JSON Server is running on port 3002");
});

