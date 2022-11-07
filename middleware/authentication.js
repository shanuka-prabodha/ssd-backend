import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const Authorized = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(404).json({
          message: error.message,
          error,
        });
      } else {
        res.locals.jwt = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({
      message: 'Unautherized',
    });
  }
};

export default Authorized;
