const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  uuid = require("uuid");
const morgan = require("morgan");

app.use(morgan("common"));
app.use(express.static("public"));
app.use("/documentation.html", express.static("public"));
(fs = require("fs")), // import built in node modules fs and path
  (path = require("path"));
app.use(bodyParser.json());

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Caca ",
    favoriteMovies: [],
  },
];

let movies = [
  {
    title: "The Lion King",
    description: "",
    genre: {
      name: "Musical Drama",
    },
    director: {
      name: "Roger Allers",
      bio: "",
    },
  },
  {
    title: "Beauty And The Beast",
    description: "",
    genre: {
      name: "Romance",
    },
    director: {
      name: "Gary Trousdale",
      bio: "",
    },
  },

  {
    title: "The Little Mermaid",
    description: "",
    genre: {
      name: "Fantasy",
    },
    director: {
      name: "John Musker",
      bio: "",
    },
  },

  {
    title: "Mary Poppins",
    description: "",
    genre: {
      name: "Fantasy",
    },
    director: {
      name: "Robert Stevenson",
      bio: "",
    },
  },

  {
    title: "Aladdin",
    description: "",
    genre: {
      name: "Romance",
    },
    director: {
      name: "John Musker",
      bio: "",
    },
  },
  {
    title: "cinderella",
    description: "",
    genre: {
      name: "Romance",
    },
    director: {
      name: "Clyde Geronimi",
      bio: "",
    },
  },

  {
    title: "Alice in Wonderland",
    description: "",
    genre: {
      name: "Fantasy",
    },
    director: {
      name: "Clyde Geronimi",
      bio: "",
    },
  },

  {
    title: " Pinocchio",
    description: "",
    genre: {
      name: "Drama",
    },
    director: {
      name: "Hamilton Luske",
      bio: "",
    },
  },
  {
    title: "The Jungle Book",
    description: "",
    genre: {
      name: "Mystery",
    },
    director: {
      name: "Wolfgang Reitherman",
      bio: "",
    },
  },

  {
    title: "Sleeping Beauty",
    description: "",
    genre: {
      name: "Romance",
    },
    director: {
      name: "David Hand",
      bio: "",
    },
  },
];

// CREATE
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

//  UPDATE
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

// POST
app.post("/users/:id/:movieTitle ", (req, res) => {
  const { id, movietitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movietitle);
    res.status(200).send(`${movietitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

// DELETE
app.delete("/users/:id/:movieTitle ", (req, res) => {
  const { id, movietitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movietitle
    );
    res
      .status(200)
      .send(`${movietitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

// DELETE user (deregister )
app.delete("/users/:id ", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res.json(users);
    //res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send("no such user");
  }
});

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

// READ
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

// get movies by title
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

// get genre by Name
app.get("/movies/genre/:genrename", (req, res) => {
  const { genrename } = req.params;
  const genre = movies.find((movie) => movie.genre.name === genrename).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre");
  }
});

// get director by name
app.get("/movies/directors/:directorname", (req, res) => {
  const { directorname } = req.params;
  const director = movies.find(
    (movie) => movie.director.name === directorname
  ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director");
  }
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
