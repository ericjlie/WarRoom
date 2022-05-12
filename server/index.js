/* eslint-disable no-plusplus */
/* eslint-disable max-len */
const express = require('express');
const path = require('path');
const expressStaticGzip = require('express-static-gzip');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { getUsers, updateUserMonster } = require('../client/src/firebase-config');
// const Routers = require('./router');
// const db = require('../database');

const app = express();
const PORT = process.env.PORT || 3000;
const users = [];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

let colorsArray = ['#5e0300', '#55005e', '#5e5a00', '#355e00', '#00355e', '#005e47', '#02005e', '#5e3500', '#fc8686', '#fcbd86', '#fcf886', '#bdfc86', '#f70707', '#86fcf8', '#9e86fc', '#86b1fc', '#e586fc', '#86fca7', '#fc869c', '#f78f07', '#9f07f7', '#63f707', '#075bf7', '#07f7ef', '#2f07f7', '#f7f707', '#f707af'];
io.on('connection', (socket) => {
  // console.log('User Connected', socket.id);
  socket.on('join_room', (data) => {
    socket.join(data.room);
    if (data.user.user && users.filter((user) => user.id === data.user.user.uid).length === 0) {
      const user = {
        name: data.user.user.displayName,
        id: data.user.user.uid,
        color: colorsArray.pop(),
      };
      users.push(user);
    }
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('recieve_message', data);
  });

  socket.on('logout', (data) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].name === data) {
        users.splice(i, 1);
      }
    }
  });

  socket.on('send_log_message', (data) => {
    socket.to(data.board).emit('recieve_log_message', data);
  });

  socket.on('send_log_message_data', (data) => {
    socket.to(data.board).emit('recieve_log_message_data', data);
  });

  socket.on('send_new_board', (newBoardSend) => {
    socket.to(newBoardSend.room).emit('recieve_new_board', newBoardSend);
  });

  socket.on('disconnect', () => {
    // console.log("User Disconnected", socket.id);
    // console.log(socket);
  });

  socket.on('send_new_board', (newBoardSend) => {
    socket.to(newBoardSend.room).emit('recieve_new_board', newBoardSend);
  });
  socket.on('logout', (data) => {
    getUsers(data)
      .then((snapshot) => {
        let books = [];
        snapshot.docs.forEach((doc) => {
          books.push({ ...doc.data(), id: doc.id });
        });
        return (books);
      })
      .then((monsterArr) => (
        Promise.all(monsterArr.map((monster) => (
          updateUserMonster(data, monster.id, { onBoard: false, locationX: -1, locationY: -1 })
        )))
      ))
      .catch((err) => console.log(err));
  });
});

app.use(express.json());
app.use(expressStaticGzip(`${__dirname}/../client/dist`));
app.use(cors());
// // app.use('/', Routers);

app.get('/users', (req, res) => {
  res.send(users);
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
app.get('*.js', (req, res, next) => {
  if (req.header('Accept-Encoding').includes('br')) {
    req.url += '.br';
    res.set('Content-Encoding', 'br');
    res.set('Content-Type', 'application/javascript; charset=UTF-8');
  }
  next();
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
