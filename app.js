//requiring npm modules
const express = require('express');
const ejs = require('ejs');
const path = require('path')
const bodyParser = require('body-parser')
const _ = require('lodash')

require("./db/mongoose")
const mongoose = require('mongoose')

const app = express();
app.set("view engine","ejs");


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "/public")));

const itemSchema = new mongoose.Schema({
    name:{
        type: String
    }
})
const Item = mongoose.model('Item', itemSchema)

// custom list Schema...
const listSchema = new mongoose.Schema({
    name: String,
    item: [itemSchema]
})

const List= mongoose.model("List", listSchema)


const item1 = new Item ({
    name: "Welcome to your todolist"
})
const item2 = new Item ({
    name: "Hit the + button to add a new item"
})
const item3 = new Item ({
    name: "<-- Hit this to delete an item"
})

const defaultItem = [item1, item2, item3]

// handling the routes...
app.get("/", (req, res) => {
    Item.find({}, (err, data) => {
        if(data.length === 0) {
            Item.insertMany(defaultItem, (err, data) => {
                if(err) {
                    console.log(err)
                }
            })
            res.redirect("/")
        }
        else {
            res.render("index",  {heading: "Today", items: data})
        }
    })
})
app.post("/", (req, res) => {
    const itemName = req.body.newItem
    const listName = req.body.list
    if(itemName !== "") {
        const newItem = Item({
            name: itemName
        })
        if(listName === "Today"){
            newItem.save()
            res.redirect("/")
        }
        else{
            List.findOne({name: listName}, (err, data) => {
                if(!err) {
                    data.item.push(newItem)
                    data.save()
                    res.redirect("/"+ listName)
                }
            })
        }
    }
    else if(listName === "Today") {
        res.redirect("/")
    }
    else{
        res.redirect("/"+ listName)
    }
})
app.post("/delete", (req, res) => {
    const dataId = req.body.checkBox
    const listName = req.body.listName
    if(listName === "Today") {
        Item.findByIdAndDelete(dataId, (err, success) => {
            if(err)
            console.log(err)
        })
        res.redirect("/")
    }
    else {
        List.findOneAndUpdate({ name: listName}, {$pull: { item: { _id: dataId } }}, (err, list) => {
            if(err)
            console.log(err)
            else {
                res.redirect("/"+ listName)
            }
        })
    }
})

// dynamic route.....
app.get("/:customListName", (req, res) => {
    const customListName= _.capitalize(req.params.customListName)
    List.findOne({name: customListName}, (err, data) => {
        if(!err) {
            if(!data) {
                const newList = new List({
                    name: customListName,
                    item: defaultItem
                })
                newList.save()
                res.redirect("/" + newList.name)
            }
            else {
                res.render("index",  {heading: data.name, items: data.item})
            }
        }
    })
})

// starting the srver at port 3000...
app.listen(3000, () => {
    console.log("Server is up on ort 3000 !!")
})
