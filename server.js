const express = require("express");
const handlebars = require("express-handlebars");
const session = require("express-session");
const app = express();
const port = 8081;

const token =
  "7eb040c4f56aaaca68b7a4f7dd963f5b5aaaa69c12f8759bf492272747e4ad1a";

app.engine(
  "handlebars",
  handlebars.engine({
    helpers: {
      increaseIdx: (idx) => idx + 1,
      checkMale: (gender) => {
        if (gender == "male") {
          return "checked";
        }
      },
      checkFemale: (gender) => {
        if (gender == "female") {
          return "checked";
        }
      },
      checkActive: (status) => {
        if (status == "active") {
          return "checked";
        }
      },
      checkInActive: (status) => {
        if (status == "inactive") {
          return "checked";
        }
      },
      increasePage: (page, num) => {
        return parseInt(page) + parseInt(num);
      },
      decreasePage: (page, num) => {
        if (parseInt(page) - parseInt(num) < 1) {
          return 1;
        }
        return parseInt(page) - parseInt(num);
      },
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({ secret: "mySecret", resave: false, saveUninitialized: false })
);

app.get("/", async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  let response = await fetch(
    `https://gorest.co.in/public/v2/users/?page=${page}&limit=${limit}`
  );
  let data = await response.json();
  let msg = req.session.msg || "";
  req.session.destroy();
  res.render("home", { data: data, msg: msg, page: page });
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", async (req, res) => {
  let { name, email, gender, status } = req.body;
  if (!name || !email || !gender || !status) {
    return res.send("Please provide required fields");
  }
  let response = await fetch("https://gorest.co.in/public/v2/users", {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    method: "post",
    body: JSON.stringify({ name, email, gender, status }),
  });
  let data = await response.json();
  res.render("details", { data: data, msg: "User created successfully!!!" });
});

app.get("/update/:id", async (req, res) => {
  let id = req.params.id;
  let response = await fetch(`https://gorest.co.in/public/v2/users/${id}`);
  let data = await response.json();
  res.render("update", { data: data });
});

app.post("/update/:id", async (req, res) => {
  let id = req.params.id;
  let { name, email, gender, status } = req.body;
  if (!name || !email || !gender || !status) {
    return res.send("Please provide required fields");
  }
  let response = await fetch(`https://gorest.co.in/public/v2/users/${id}`, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    method: "put",
    body: JSON.stringify({ name, email, gender, status }),
  });
  let data = await response.json();
  res.render("details", { data: data, msg: "User updated successfully!!!" });
});

app.get("/details/:id", async (req, res) => {
  let id = req.params.id;
  let response = await fetch(`https://gorest.co.in/public/v2/users/${id}`);
  let data = await response.json();
  res.render("details", { data: data });
});

app.get("/delete/:id", async (req, res) => {
  let id = req.params.id;
  let response = await fetch(`https://gorest.co.in/public/v2/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "delete",
  });
  req.session.msg = `User ID ${id} deleted successfully!!!`;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
