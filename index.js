const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(morgan("common"));
app.use(express.static("public"));
app.use("/documentation.html", express.static("public"));
(fs = require("fs")), // import built in node modules fs and path
  (path = require("path"));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

let top10Movies = [
  {
    title: "The Lion King",
    director: "Roger Allers",
    genre: "Musical Drama",
  },
  {
    title: "Beauty And The Beast",
    director: "Gary Trousdale",
    genre: "Musical, Romance, Fantasy",
  },
  {
    title: "The Little Mermaid",
    director: "John Musker",
    genre: "Musical, Romance, Fantasy",
  },
  {
    title: "Mary Poppins",
    director: "Robert Stevenson",
    genre: "Musical, Comedy, Fantasy",
  },
  {
    title: "Aladdin",
    director: "John Musker",
    genre: "Musical, Romance, Fantasy, Adventure",
  },
  {
    title: "cinderella",
    director: "Clyde Geronimi",
    genre: "Drama, Romance, Fantasy",
  },
  {
    title: "Alice in Wonderland",
    director: "Clyde Geronimi",
    genre: "Fantasy",
  },
  {
    title: " Pinocchio",
    director: "Hamilton Luske",
    genre: "Musical, Adventure, Drama",
  },
  {
    title: "The Jungle Book",
    director: "Wolfgang Reitherman",
    genre: "Mystery, Adventure",
  },
  {
    title: "Sleeping Beauty",
    director: "David Hand",
    genre: "Musical, Romance, Fantasy",
  },
];

// GET requests
app.get("/", (req, res) => {
  res.("Welcome to myFlix!");
});send

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

app.get("/movies", (req, res) => {
  res.json(top10Movies);
});

// ERROR Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
