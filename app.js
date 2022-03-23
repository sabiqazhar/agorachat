const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

let users = {};
let usernames = [];

app.get("/", (req, res) =>{
    res.sendFile(__dirname+"/index.html");
});

io.on("connection", (socket) => {

    //respond to online user
    socket.broadcast.emit("newMessage", "someone connected");

    //when user regist
    socket.on("registerUser", (user) =>{
      if (usernames.indexOf(user) != -1) {
        socket.emit("registerRespond", false);
      } else {
        users[socket.id] = user;
        usernames.push(user);
        socket.emit("registerRespond", true);
        io.emit("addOnlineUser", usernames);
      }
    })

    //if add new message
    socket.on("newMessage", (msg) => {
        io.emit("newMessage", msg);
        console.log("New Message: " + msg);
    });

    //if user typing
    socket.on("newTyping", (msg) => {
      io.emit("newTyping", msg);
  });

    //if disconnect
    socket.on("disconnect", (msg) =>{
      socket.broadcast.emit("newMessage", "someone left the chat");

      let index = usernames.indexOf(users[socket.id]);
      usernames.splice(index, 1);
      
      delete users[socket.id];

      io.emit('addOnlineUser', usernames);
    })
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
http.listen(port, ()=>{
  console.log("server listening on port");
})