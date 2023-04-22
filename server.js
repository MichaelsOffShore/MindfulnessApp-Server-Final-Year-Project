// Importing dependencies
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const date = require("date-and-time");
const fs = require("fs");
const http = require("http")
const app = express();
const port = 8000;
const server = http.createServer(app);
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const uri =
  "MongoDB Database URL goes here with password!";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


// Main Endpoint
app.get("/", (req, res) => {
  console.log("request recieved");
  res.send("Server is Online on Port:" + port);
});

app.post("/generateToken", function requestHandler(req, res) {
  const testKeys = req.body["testKeys"];
  let numOfTokens = req.body["numOfTokens"];
  let taskLink = req.body["link"];

  let data = {};
  let prefixBank = [];

  const tokenGen = async (data) => {
    try {
      console.log("request for token generation");
      console.log(req.body);

      for (let i = 0; i < numOfTokens; i++) {
        let randomPrefix = generateTokenPrefix();
        if (!prefixBank.includes(randomPrefix)) {
          prefixBank.push(randomPrefix);
        } else {
          i--;
        }
      }
      for (let j = 0; j < prefixBank.length; j++) {
        prefixBank[j] = prefixBank[j] + testKeys;
        data = { token: prefixBank[j], link: taskLink};
        addToDatabase("tokens", data);
      }
    } catch (err) {
      console.log("error");
      console.log(err);
    }
  };

  tokenGen();

  res.send(prefixBank);
});

app.get("/tokenValidation", (req, res) => {
  console.log("request for token verification recieved");

  let d = req.query.token;

  tokenInDatabase(d).then((token) => {
    console.log("TOKEN IS: " + token);
    res.send(token);
  });
});

app.get("/quote", (req, res) => {
  console.log("request for quote recieved");

  const quotes = [
    "Don't cry because it's over, smile because it happened.",
    "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    "A friend is someone who knows all about you and still loves you.",
    "That which does not kill us makes us stronger.",
    "If you judge people, you have no time to love them.",
    "Everything you can imagine is real.",
    "If you tell the truth, you don’t have to remember anything.",
    "Many of life’s failures are people who did not realize how close they were to success when they gave up.",
    "Life is too short to spend another day at war with yourself.",
    "Be a voice, not an echo.",
    "No matter the time of day, no matter who is watching, and no matter what the situation, personal integrity doesn’t take a holiday.",
    "We are our choices.",
    "There is no beauty without some strangeness.",
    "The love we give away is the only love we keep.",
    "If you have only one smile in you give it to the people you love.",
    "Great hopes make great men.",
    "Memories of our lives, of our works and our deeds will continue in others.",
    "The past cannot be changed. The future is yet in your power.",
    "I don’t dream at night, I dream all day; I dream for a living.",
    "When you have a dream, you’ve got to grab it and never let go.",
  ];

  let names = [
    "Dr. Seuss",
    "Elbert Hubbard",
    "Jane Five",
    "Friedrich Nietzsche",
    "Mother Teresa",
    "Pablo Picasso",
    "Mark Twain",
    "Thomas Edison",
    "Confucius",
    "Albert Einstein",
    "Byron Pulsifer",
    "J.P. Sartre",
    "Edgar Allen Poe",
    "Elbert Hubbard",
    "Maya Angelou",
    "Thomas Fuller",
    "Rosa Parks",
    "Mary Pickford",
    "Steven Spielberg",
    "Carol Burnett",
  ];
  let randomNum = randomNumInInterval(0, quotes.length - 1);
  let quote = quotes[randomNum];
  let person = names[randomNum];

  res.send([quote, person]);
});

app.get("/downloadFile", (req, res) => {
  const path = "./tempFiles/tokens.csv";
  let text = "";

  var ccc = client.db("mindfulnessApp").collection("tokens");

  ccc.find().forEach(
    function (doc) {
      text += doc["token"] + ",";
    },
    () => {
      console.log("text: " + text);

      ////

      fs.writeFile(path, text, function (err) {
        if (err) {
          console.log("There has been an error");
        }
        console.log("File is created successfully.");

        res.send(text.substring(0, text.length));
        console.log("file sent");
      });
    }
  );
});

app.post("/addQuestionnaireData", function requestHandler(req, res) {
  console.log("Questionnaire Data Recieved: \n" + JSON.stringify(req.body));
  addToDatabase("questionnaireData", req.body);
  res.send(req.body);
});

server.listen(port, () => {
  console.log("Server Listening On Port " + port);
});
var col = client.db("mindfulnessApp").collection("tokens");

const tokenInDatabase = async (data) => {
  let result;
  try {
    result = await checkDatabase(data);
  } catch (err) {
    console.log("error");
    console.log(err);
  }
  console.log("RESULT:" + result)
  return result;
};

function checkDatabase(data) {
  return new Promise((resolve, reject) => {
    const collection = client.db("mindfulnessApp").collection("tokens");
    const res = [0, ""];

    collection.find({}).toArray(function (err, docs) {
      if (err) {
        reject(err);
      } else {
        for (let i = 0; i < docs.length; i++) {
          if (docs[i]["token"] === data) {
            res[0] = 1;
            res[1] = docs[i]["link"];
            break;
          }
        }
        resolve(res);
      }
    });
  });
}

function generateTokenPrefix() {
  const tokenMakerBank = [
    "A",
    "B",
    "0",
    "C",
    "D",
    "1",
    "E",
    "2",
    "F",
    "G",
    "H",
    "I",
    "3",
    "J",
    "4",
    "K",
    "L",
    "5",
    "M",
    "N",
    "O",
    "6",
    "P",
    "Q",
    "7",
    "R",
    "S",
    "T",
    "8",
    "U",
    "V",
    "W",
    "X",
    "9",
    "Y",
    "Z",
  ];
  let generatedToken = "";

  for (let i = 0; i < 4; i++) {
    let random = randomNumInInterval(0, 35);
    generatedToken += tokenMakerBank[random];
  }

  return generatedToken;
}

function randomNumInInterval(min, max) {
  // max and min  are included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getDateTimeNow() {
  const pattern = date.compile("MMM D YYYY h:m:s A");
  return date.format(new Date(), pattern);
}

function addToDatabase(collection, inputData) {
  try {
    const dbCollection = client.db("mindfulnessApp").collection(collection);
    dbCollection.insertOne(inputData);
    console.log('Data Succesfully Added to Collection - "' + collection + '"');
  } catch (err) {
    console.log("DB AddData Operation FAILED...");
    console.log(err);
  }
}

function closeDBConnnection() {
  console.log("DB connection Ended");
  client.close();
}
