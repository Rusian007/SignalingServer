const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(socket.user, "Connected");
    socket.join(socket.user);
    
  /****************************For chat */
  socket.on("chatSend", (data) => {
    let senderID = socket.user;
    let receiverID = data.receiverID;
    let senderType=data.senderType;
    let chatMessage = data.chatMessage;

    
    socket.to(receiverID).emit("chatReceived", {
      chatMessage,
      senderID,
      receiverID,
      senderType
    });
  });

  /****************************End chat */
    socket.on("call", (data) => {
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      console.log("**********************************");
      console.log("rtcMessage",rtcMessage );
      console.log("**********************************");
      socket.to(calleeId).emit("newCall", {
        callerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      rtcMessage = data.rtcMessage;

      console.log("answerCall" );
      console.log("rtcMessage",rtcMessage );
      socket.to(callerId).emit("callAnswered", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("endCall", (data) => {
      let callerId = data.callerId;
      rtcMessage = data.callEnd;

      
      socket.to(callerId).emit("callEnd", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });



    socket.on("ICEcandidate", (data) => {
      
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      console.log("###############################");
      console.log("socket.user emit", socket.user);
      console.log("socket.user emit", rtcMessage);
       console.log("###############################");
      
      socket.to(calleeId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error("IO not initilized.");
  } else {
    return IO;
  }
};
