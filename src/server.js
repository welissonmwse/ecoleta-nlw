const express = require("express")
const server = express()

// Pegar o banco de dados
const db = require("./database/db")

server.use(express.static("public")) // Configurar pasta publica

//habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({extended: true}))



//utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})









//req = requisição
// res = resposta do servidor
server.get("/", (req, res) =>{
    return res.render("index.html")
})

server.get("/create-point", (req, res) =>{
    //req.query: Query string da nossa url
   // console.log(req.query)

    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) =>{
    //req.body: o corpo do nosso formulario
    // inserir dados no banco de dados
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err){
        if(err){
            console.log(err)
            return res.send("Erro no cadastro!")
        }
        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", {saved: true})
    }

    db.run(query, values, afterInsertData)

    
})




server.get("/search-results", (req, res) =>{
    const search = req.query.search

    if(search == ""){
        //pesquisa vazia
        return res.render("search-results.html", {total: 0})

    }

    //pegar os arquivos do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE "%${search}%"`, function(err, rows){
        if(err){
            return console.log(err)
        }
        const total = rows.length

        // console.log("Aqui estao seus regristros: ")
        // console.log(rows)
        //mostar a página html com os regitros do danco de dados
        return res.render("search-results.html", {places: rows, total: total})
    })
})

server.listen(3000) // Ligar o servidor