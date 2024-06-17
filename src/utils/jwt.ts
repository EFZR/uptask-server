import jwt from "jsonwebtoken";

export function generateJWT() {
  const data = {
    name: "emerson",
  };

  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: "6m",
  });

  return token;
}
