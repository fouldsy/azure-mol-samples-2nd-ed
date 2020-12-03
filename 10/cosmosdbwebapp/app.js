// This script sample is part of "Learn Azure in a Month of Lunches - 2nd edition" (Manning
// Publications) by Iain Foulds.
//
// This sample script covers the exercises from chapter 10 of the book. For more
// information and context to these commands, read a sample of the book and
// purchase at https://www.manning.com/books/learn-azure-in-a-month-of-lunches-2nd-edition
//
// This script sample is released under the MIT license. For more information,
// see https://github.com/fouldsy/azure-mol-samples-2nd-ed/blob/master/LICENSE

// This is a very basic Node.js app using Express to display a pizza menu.
// To keep things simple if Node.js is new to you, there's no error handling 
// or other Node.js best practices using things like promises.

// The goal of this app is to show the very basics of how easy it is to query
// Cosmos DB and then display a basic web page using the information returned.

"use strict";

// Include and define the Express components for a basic web server
var express = require('express')
var app = express()
const port = process.env.PORT || 3000

// Include the CosmosDB components and define connection information
const CosmosClient = require('@azure/cosmos').CosmosClient

const config = require('./config')
const endpoint = config.endpoint
const key = config.key

const databaseId = config.database.id
const containerId = config.container.id

// Create a Cosmos DB client
const client = new CosmosClient({ endpoint, key})

// Asynchronous function to query Cosmos DB for the pizza menu items
async function findPizzas() {
    const { resources } = await client
        .database(databaseId)
        .container(containerId)
        .items.query('SELECT c.description,c.cost FROM c')
        .fetchAll()

    return resources
}

// Asynchronous fuction to show the pizza menu
// This function waits for the Cosmos DB query to successfully return
// then renders the menu using the Express webe server
async function showPizzas(req, res) {
    const pizzas = await findPizzas();

    // Render the returned list of pizzas from Cosmos DB
    res.render("index", {
      "pizzas": pizzas
    });
  }

// Show the index page when the root page is opened in a web browser
app.get('/', (req, res, next) => showPizzas(req, res).catch(next))

// Use Pug as the rendering engine and then start the Express webserver
app.set('view engine', 'pug')
app.listen(port, () => console.log(`Pizza store listening on port ${port}!`))
