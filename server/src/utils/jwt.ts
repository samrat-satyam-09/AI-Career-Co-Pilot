import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPayload {
  id: string;
  role: string;
}

// Generate short-lived access token (15 min)
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "15m") as any,
  });
};

// Generate long-lived refresh token (7 days)
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "7d") as any,
  });
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload & JwtPayload => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload &
    JwtPayload;
};

// Verify refresh token
export const verifyRefreshToken = (
  token: string
): TokenPayload & JwtPayload => {
  return jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET!
  ) as TokenPayload & JwtPayload;
};

// Set refresh token as httpOnly secure cookie and isLoggedIn as client-readable cookie
export const setRefreshTokenCookie = (
  res: import("express").Response,
  token: string
): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Updated to lax to allow cross-origin Google redirect cookies to set cleanly
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  res.cookie("isLoggedIn", "true", {
    httpOnly: false, // client-readable!
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

// Clear refresh token and isLoggedIn cookies
export const clearRefreshTokenCookie = (
  res: import("express").Response
): void => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  res.cookie("isLoggedIn", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
};
