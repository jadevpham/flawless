// server.js
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
    tokenMap[token] = user.id;

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

// Default router
server.use(router);

server.listen(3001, () => {
  console.log("JSON Server is running on port 3001");
});
