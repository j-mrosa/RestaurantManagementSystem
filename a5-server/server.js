const express = require("express");
const cors = require("cors");
const path = require("path");
const acc = require("./db/MenuItemAccessor");
const app = express();
const port = 8000;

//use cors
app.use(cors());

//converts the body
app.use(express.json());

//built-in static file server
app.use(express.static("public"));

//route the url patterns
//get all
app.get("/items", async function(req,res){
    //try to read items from MongoDB and return them
    //content type is set automatically
    try {
        let data = await acc.getAllItems();   
        //returns status 200 if successful    
        res.status(200).json(data);
    } catch (error) {
        //returns status 500 is cannot read data
        res.status(500).json({ok: false, err: "could not read data"});
    }
});

//get item with specified ID
app.get("/items/:itemID([1-9]\\d\\d)", async function(req,res){
    //returns 405 - operations is not allowed
    res.status(405).json({ok: false, err: "individual GET not allowed"});
});

//delete items
app.delete("/items/", async function(req,res){
    //returns status 405 - operation is not allowed
    res.status(405).json({ok: false, err: "bulk deletes not allowed"});
});

//delete item with specified ID
app.delete("/items/:itemID([1-9]\\d\\d)", async function(req,res){
    //get id from the url
    let id  = req.params.itemID;
    
    //create an obj with the id in the url
    let item = {
        id: +id,
        category: "",
        description: "",
        price: 0,
        vegetarian: true
    };

    try {
        //call accessor method and store the result
        let result = await acc.deleteItem(item);       
        
        if (result) {
            //returns status 200 is delete was successful
            res.status(200).json({ok: true, err: null});
        } else {
            //returns status 404 if item was not found in db
            res.status(404).json({ok: false, err: "item does not exist"});
        }
    } catch (error) {
        //return status 500 if cannot read data
        res.status(500).json({ok: false, err: "could not read data"});
    }
});

//post items
app.post("/items/", async function (req,res){
    //returns status 405 - operation is not allowed
    res.status(405).json({ok: false, err: "bulk inserts not allowed"});
});

//post item with specified ID
app.post("/items/:itemID([1-9]\\d\\d)", async function(req,res){
    //get item from the request body
    let item = req.body;
    try {
        //call accessor method and store the result
        let result = await acc.addItem(item);       
        //console.log(result)
        if (result) {
            //returns status 201 if item was successfully created
            res.status(201).json({ok: true, err: null});
        } else {
            //returns status 409 if item already exists in db
            res.status(409).json({ok: false, err: "item already exists"});
        }
    } catch (error) {
        //returns status 500 if cannot read data
        res.status(500).json({ok: false, err: "could not read data"});
    }
});

//put - update items
app.put("/items/", async function (req,res){
    //returns status 405 - operation is not allowed
    res.status(405).json({ok: false, err: "bulk updates not allowed"});
});

//put - update item with specified ID
app.put("/items/:itemID([1-9]\\d\\d)", async function(req,res){
    //get item from the request body
    let item = req.body;
    //console.log(item)
    try {
        //call accessor method and store the result
        let result = await acc.updateItem(item);       
        
        if (result) {
            //returns status 200 if update was successful
            res.status(200).json({ok: true, err: null});
        } else {
            //returns status 404 if item does not exist in db
            res.status(404).json({ok: false, err: "item does not exist"});
        }
    } catch (error) {
        //returns status 500 if cannot read data
        res.status(500).json({ok: false, err: "could not read data"});
    }
});


// Custom 404 
app.use(function (req, res, next) {
    res.status(404).sendFile(path.resolve("./public/404.html"));
});



// start the server
app.listen(port, () => console.log(`Listening on port ${port}!`));