/**
 * Start everything from here
 */
(function () {
    // Setup socket-io main connection
    console.log('Connecting to socket-io');
    const socket = io('http://192.168.1.8:3000');
    socket.on('connect', () => {
        console.log('Socket-io connected');
        // Connect to the room
        connectToRm(socket.id);
        dataSender(socket)
        dataListener(socket);
    });
})();


/**
 * Connect to the socket-io room for the chat window.
 * 
 * @param {*} socketId 
 */
function connectToRm(socketId) {
    console.log('Connecting to socket room');
    Http.Get('/api/game/connect-socket-room/' + socketId)
        .then(() => {
            console.log('Connected to socket room');
        });
}


/**
 * Send a message.
 * 
 * @param {*} socketId
 */
function dataSender(socket) {
    socketId = socket.id
    document.addEventListener('click', function (event) {
        event.preventDefault();
        var ele = event.target;
        // Detect btn click
        if (ele.matches('#ready')) {
            /*const name = document.getElementById('name').value;
            // Call API
            Http.Post('/api/game/ready', {
                socketId,
                name,
            })
            .then(() =>{
                try {   document.getElementById('login').innerHTML="<h1>Lütfen bekleyiniz</h1>"  } catch (error) {   }
            })*/
            (function () {
                document.onmousemove = handleMouseMove;

                function handleMouseMove(event) {
                    var eventDoc, doc, body;
                    event = event || window.event;
                    if (event.pageX == null && event.clientX != null) {
                        eventDoc = (event.target && event.target.ownerDocument) || document;
                        doc = eventDoc.documentElement;
                        body = eventDoc.body;

                        event.pageX = event.clientX +
                            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                            (doc && doc.clientLeft || body && body.clientLeft || 0);
                        event.pageY = event.clientY +
                            (doc && doc.scrollTop || body && body.scrollTop || 0) -
                            (doc && doc.clientTop || body && body.clientTop || 0);
                    }


                    byteCounter=0;
                    var totalbuffer = new ArrayBuffer(32 * 4);                    
                    var totalView=new Int8Array(totalbuffer)
                    var data32Buffer = new ArrayBuffer(4);
                    a =new Int32Array(data32Buffer)
                    a[0]=2554156465465654
                    a_Push=new Int8Array(data32Buffer)
                    totalView[byteCounter]=a_Push[0]
                    byteCounter++;
                    totalView[byteCounter]=a_Push[1]
                    byteCounter++;
                    totalView[byteCounter]=a_Push[2]
                    byteCounter++;
                    totalView[byteCounter]=a_Push[3]
                    byteCounter++;

                    totalView[byteCounter]=0
                    byteCounter++
                    totalView[byteCounter]=0
                    byteCounter++
                    totalView[byteCounter]=23
                    byteCounter++
                    totalView[byteCounter]=0
                    byteCounter++
                    totalView[byteCounter]=0
                    byteCounter++


                    a =new Int32Array(data32Buffer)
                    a[0]=2554156465465654
                    a_Push=new Int8Array(data32Buffer)
                    totalView[byteCounter]=a_Push[0]
                    byteCounter++;
                    totalView[byteCounter]=a_Push[1]
                    byteCounter++;
                    totalView[byteCounter]=a_Push[2]
                    byteCounter++;
                    totalView[byteCounter]=a_Push[3]
                    byteCounter++;












                    












                    byteCounter=0;
                    var totalbuffer = new ArrayBuffer(32 * 4);
                    a =new Int32Array(totalbuffer)
                    a[byteCounter/4]=13
                    byteCounter+=4
                    a[byteCounter/4]=4
                    byteCounter+=4
                    a[byteCounter/4]=34
                    byteCounter+=4

                    a =new Int8Array(totalbuffer)
                    a[byteCounter]=0
                    byteCounter++;

                    a =new Int32Array(totalbuffer)
                    //ztotalbuffer.




                    for (let i = 0; i < 16; i++) {

                        totalView = new Float32Array(totalbuffer)
                        totalView[i]=i+0.13;

                    }
                    for (let i = 64; i < 128; i++) {

                        totalView = new Int8Array(totalbuffer)
                        totalView[i]=i;

                    }
                    var bufView = new Float32Array(totalbuffer);
                    console.log(bufView);
                    var bufView = new Int8Array(totalbuffer);
                    console.log(bufView);
                    socket.emit('news', totalbuffer);
                }
            })();
        }
    });

    document.addEventListener('keypress', function (event) {
        if ($("#you").length && ["w", "a", "s", "d", "x"].includes(event.key)) {
            Http.Post('/api/game/move', {
                socketId,
                key: event.key,
            })
            switch (event.key) {
                case "w":
                    $("#you").css("top", (parseInt($("#you").css("top")) - 1) + "px")
                    break;
                case "a":
                    $("#you").css("left", (parseInt($("#you").css("left")) - 1) + "px")
                    break;
                case "s":
                    $("#you").css("top", (parseInt($("#you").css("top")) + 1) + "px")
                    break;
                case "d":
                    $("#you").css("left", (parseInt($("#you").css("left")) + 1) + "px")
                    break;
                default:
                    break;
            }
        }
    })
}



function dataListener(socket) {
    socket.on('start', () => {
        start();
    });
    socket.on('position', (response) => {
        if (!$("#opponnet").length) {
            $("body").append(`<div class="cube" id="opponnet"></div>`)
        }
        var bufView = new Uint16Array(response);
        // console.log(bufView[0] + "," + bufView[1])
        $("#opponnet").css("top", bufView[1] + "px")
        $("#opponnet").css("left", bufView[0] + "px")
    });
}



function start() {
    document.getElementById('login').remove()
    $("#game-area").html("")
    $("#game-area").append(`<div class="cube" id="you"></div>`)
    $("#game-area").append(`<div class="cube" id="opponnet"></div>`)
}