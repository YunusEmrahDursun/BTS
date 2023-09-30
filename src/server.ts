import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import http from 'http';
import helmet from 'helmet';
var createError = require('http-errors');
import session from 'express-session';
import config from '@database/config';
import md5 from 'md5';


var MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore(config.sessionServer);
if(!global.sessionStore){
  global.sessionStore=sessionStore;
}

const databaseName = config.databaseName;
if(!global.databaseName){
  global.databaseName=databaseName;
}

import { Server as SocketIo } from 'socket.io';
import express, { NextFunction, Request, Response } from 'express';

import 'express-async-errors';

import Routes from '@routes/index';
import logger from 'jet-logger';

const app = express();


//session
app.use(session({
  secret: 'keyboardCat',
  resave: true,
  store: sessionStore,
  saveUninitialized: true,
  cookie: { secure: false,maxAge: (30 * 86400 * 1000) },
}))


declare module 'express-session' {
  export interface SessionData {
    user: any;
    auth: any;
  }
}


if (app.get('env') === 'development') {
  app.locals.pretty = true;
}


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser("WisdomWord"));
app.set('view engine', 'pug');

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    //app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

app.use( (req: Request, res: Response,next:NextFunction) => {
    const period = 84600
    try {
        if(["/fonts","/images","/javascripts","/stylesheets", "/favicon.ico"].some(x=> req.url.indexOf(x)==0  )){
          res.set('Cache-control', `public, max-age=${period}`)
        }
      } catch (error) {
        
      }
    next();
});


app.use('/', Routes);

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}



const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //next(createError(404));
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.status = err.status || 500;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  logger.err(err, true);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
/*
// Error handling
app.use((err: Error | CustomError, _: Request, res: Response, __: NextFunction) => {
    logger.err(err, true);
    const status = (err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST);
    res.render('error',{  error: err.message,status:status    });
});
*/



const server = http.createServer(app);
const io = new SocketIo(server,{
    cors: {
      origin: '*',
    }
  });

io.sockets.on('connect', (socket) => {
    
    return app.set('socketio', io);
});
 


export default server;
