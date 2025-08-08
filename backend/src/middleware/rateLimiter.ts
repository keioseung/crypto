import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 간단한 메모리 기반 rate limiter (실제 프로덕션에서는 Redis 사용 권장)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 60초
const MAX_REQUESTS = 100;

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  const userRequests = requestCounts.get(ip);
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    next();
  } else if (userRequests.count < MAX_REQUESTS) {
    userRequests.count++;
    next();
  } else {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.round((userRequests.resetTime - now) / 1000)
      }
    });
  }
};

// API별 세분화된 rate limiting
const apiRequestCounts = new Map<string, { count: number; resetTime: number }>();
const API_MAX_REQUESTS = 50;

export const apiRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  
  const userRequests = apiRequestCounts.get(key);
  
  if (!userRequests || now > userRequests.resetTime) {
    apiRequestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    next();
  } else if (userRequests.count < API_MAX_REQUESTS) {
    userRequests.count++;
    next();
  } else {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'API rate limit exceeded. Please try again later.',
        retryAfter: Math.round((userRequests.resetTime - now) / 1000)
      }
    });
  }
};

// WebSocket rate limiting
const wsRequestCounts = new Map<string, { count: number; resetTime: number }>();
const WS_MAX_REQUESTS = 200;

export const wsRateLimiterMiddleware = async (req: any) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  const userRequests = wsRequestCounts.get(ip);
  
  if (!userRequests || now > userRequests.resetTime) {
    wsRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  } else if (userRequests.count < WS_MAX_REQUESTS) {
    userRequests.count++;
    return true;
  } else {
    logger.warn(`WebSocket rate limit exceeded for IP: ${ip}`);
    return false;
  }
};

// 기본 rate limiter export
export const rateLimiter = rateLimiterMiddleware;
