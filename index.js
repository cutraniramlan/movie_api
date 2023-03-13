const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./models.js");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;
const Genre = Models.Genre;
const Directors = Models.Director;

/* mongoose.connect("mongodb://localhost:27017/dbname", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 */

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(morgan("common"));
app.use(express.static("public"));
app.use("/documentation.html", express.static("public"));
(fs = require("fs")), // import built in node modules fs and path
  (path = require("path"));
app.use(bodyParser.json());

const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "https://movie-api-rani-1.herokuapp.com",
  "http://localhost:1234",
  "http://myflix-rani.netlify.app",
  "https://www.themoviedb.org",
  "http://localhost:4200",
  "https://myflix-movie-api.onrender.com/",
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log(origin);
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

/* const cors = require("cors");
app.use(cors()); */
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

// CREATE or READ
/**
 * Gets "Welcome to FlixThis!" message.
 * @function get/welcome
 * @return Welcome message.
 */

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

// READ Movies

/**
 * Gets list of all movies.
 * @function get/movies
 * @returns Array of all movies.
 */

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Get movie by title
/**
 * Gets a specific movie.
 * @function get/movieBytitle
 * @params title
 * @returns Movie object.
 */

app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// get genre by Name

/**
 * Gets a movie genre by name.
 * @function get/genreByname
 * @params genre.name
 * @returns Genre object.
 */

app.get(
  "/movies/genre/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "genre.name": req.params.name })
      .then((genre) => {
        res.json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//GET movies by a director

/**
 * Gets a movie director by name.
 * @function get/directorbyname
 * @params director.name
 * @returns Director object.
 */

app.get(
  "/movies/directors/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "director.name": req.params.name })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get all users

/**
 * Get all users.
 * @function get/users
 * @returns An array of users.
 */

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a user by username
/**
 * Gets specific user.
 * @function get/userByUsername
 * @params Username
 * @returns A specific user object.
 */

app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/

/**
 * Creates a new user.
 * @function post/user
 * @params Username
 * @params Password
 * @params Email
 * @returns New user object.
 */

app.post(
  "/users",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

//  UPDATE

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/

/**
 * Updates a specific user data.
 * @function put/userByUsername
 * @params Username
 * @params Password
 * @params Email
 * @returns User object with updated user info.
 */

app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Allow users add to their list of Favorites (create)

/**
 * Adds a new favorite movie for a specific user.
 * @function post/movieByMovieID
 * @params Username
 * @params MovieID
 * @returns Updated user object with new favorite movie.
 */

app.post("/users/:username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { username: req.params.username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, //This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Delete movie from favorite list
/**
 * Deletes favorite movie from user.
 * @function delete/movieByMovieID
 * @params Username
 * @params MovieID
 * @returns Updated user object with previously favorite movie removed.
 */

app.delete("/users/:username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { username: req.params.username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// DELETE user (deregister )

/**
 * Deletes user.
 * @function delete/user
 * @params Username
 * @returns Message stating the user has either been deleted or does not currently exist.
 */

app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// ERROR Handling

/**
 * Error handler.
 * @function err
 * @returns Error message.
 */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// listen for requests
/**
 * @constant
 * type {string}
 */

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
