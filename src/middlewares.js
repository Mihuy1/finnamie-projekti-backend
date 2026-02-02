import jwt from "jsonwebtoken";

const authorize = (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No session found." });

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired session." });
  }
};

const allowSelfOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Access denied." });

  const targetId = String(req.params.id);
  const userId = String(req.user.id);

  if (userId !== targetId && req.user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Forbidden: insufficient permissions." });

  next();
};

const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Acess denied." });

    const role = String(req.user.role ?? "");

    if (!roles.inckudes(role))
      return res.status(403).json({ message: "Forbidden." });

    next();
  };

export { authorize, allowSelfOrAdmin, allowRoles };
