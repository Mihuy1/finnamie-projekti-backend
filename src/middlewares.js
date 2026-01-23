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

export { authorize };
