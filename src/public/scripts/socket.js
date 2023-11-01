/**
 * Start everything from here
 */
(function() {
    // Setup socket-io main connection
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
        socketIo = socket;
        socket.on('update', (msg) => {
            if(msg == "refreshTable"){
                try {
                    getDasboardTableData()
                } catch (error) {
                    
                }
            }
        });
       
    });
})();

