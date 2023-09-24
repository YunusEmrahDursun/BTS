var Http = (function () {
    // Setup request for json
    var getOptions = function (verb, data) {
        var options = {
            dataType: "json",
            method: verb,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        return options;
    }
    var Response = async function (response, callback) {
        if(callback!=undefined) {
            let data=await response.json();
            callback(data);
            maskClose();
        }
        
    }
    
    // Set Http methods
    return {
        Get: async function (path,callback) {
            maskOpen();
            Response(await fetch(path, getOptions("GET")),callback);
        },
        Post: async function (path, data,callback) {
            maskOpen();
            Response(await fetch(path, getOptions("POST", data)),callback);
            if(callback) callback(result)
        },
        Put: async function (path, data,callback) {
            maskOpen();
            Response(await fetch(path, getOptions("PUT", data)),callback);
        },
        Delete: async function (path,callback) {
            try {
                $.confirm({
                    content: "",
                    theme: 'material',
                    type: 'red',
                    title: 'Eminmisiniz?',
                    draggable: false,
                    buttons: {
                        confirm: {
                            btnClass: 'btn-red',
                            text: 'Evet',
                            action: async function () {
                                Response(await fetch(path, getOptions("DELETE")),callback);
                            }
                        },
                        cancel: {
                            btnClass: 'btn-default',
                            text: 'Hayır',
                            action: function () {
                                maskClose();
                            }
                        }
                    }
                }); 
            } catch (error) {
                console.error(error)
            }
        }
    };
})();
