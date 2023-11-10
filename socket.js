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

    // Handle incoming call request
  socket.on('call', (data) => {
    let calleeId = data.calleeId;
    let rtcMessage = data.rtcMessage;

    console.log("Call going to " + calleeId );
    // Send the call request to the recipient
    IO.to(calleeId).emit('incomingCall', {
      callerId: socket.user,
      // Add relevant data here
    });
  });

     // Handle answer call
  socket.on('answerCall', (data) => {
    // Send the answer to the caller
    let callerId = data.callerId;
     let roomUrl = data.roomUrl;
    console.log("Call send by " +callerId);
    console.log("URL SEND BY CLIENT >>>>>>>>>>");
    console.log(roomUrl);
    IO.to(callerId).emit('callAnswered', {
      calleeId: socket.user,
      roomURL : roomUrl
      // Add relevant data here
    });
  });

   // Handle call end
   socket.on('endCall', (data) => {
    // Notify the other party that the call has ended
    IO.to(data.targetId).emit('callEnded', {
      // Add relevant data here
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
