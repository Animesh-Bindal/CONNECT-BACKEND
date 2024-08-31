const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use(cors({ origin: "*" }));
dotenv.config();
app.use(express.json());

const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Server is Connected to Database");
  } catch (err) {
    console.log("Server is NOT connected to Database", err.message);
  }
};
connectDb();

app.get("/", (req, res) => {
  res.send("API is running123");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => console.log(`Server is Running on port ${port}...`));

const io = require("socket.io")(server, {
  cors: { origin: "*" },
  pingTimeout: 60000,
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("setup", (userData) => {
    socket.join(userData.data._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room:", room);
  });

  socket.on("newMessage", (newMessageStatus) => {
    const chat = newMessageStatus.chat;
    if (!chat.users) {
      return console.log("chat.users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id !== newMessageStatus.sender._id) {
        socket.to(user._id).emit("message received", newMessageStatus);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


/*

const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const app = express();
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// const { createServer } = require("http");
// const { Server } = require("socket.io");

app.use(
  cors({
    origin: "*",
  })
);
dotenv.config();

app.use(express.json());

const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log("Server is Connected to Database");
  } catch (err) {
    console.log("Server is NOT connected to Database", err.message);
  }
};
connectDb();

app.get("/", (req, res) => {
  res.send("API is running123");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORTT || 8080;
const server = app.listen(port, console.log(`Server is Running on port ${port}...`));

const io = require("socket.io")(server, {
  cors:{
    origin: "*",
  },
  pingTimeout: 60000,
  transports: ["websocket", "polling"]
})

io.on("connection", (socket) => {
  // console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData.data._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("newMessage", (newMessageStatus) => {
    console.log(newMessageStatus);
    var chat = newMessageStatus.chat;
    if (!chat.users) {
      return console.log("chat.users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id == newMessageStatus.sender._id) return;
      socket.in(user._id).emit("message received", newMessageStatus);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    // Handle disconnection if needed
  });
});


*/

