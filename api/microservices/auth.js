const express = require("express");
const server = express();
var morgan = require("morgan");
const { User, Account, Unregistered, Accounttransaction, Transaction } = require("../db");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
var Strategy = require("passport-local").Strategy;
const crypto = require("crypto");
const { formatDate } = require("date-utils-2020");
let DateGenerator = require("random-date-generator");
const { Op } = require("sequelize");

server.use(morgan("dev"));
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors());

server.use(passport.initialize());

passport.use(
  "localStrategy",
  new Strategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    function (username, password, done) {
      console.log("LOGIN CALLED");
      User.findOne({
        where: {
          username: username.toLowerCase(),
        },
      })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "User not exists." });
          }
          const auth = user.correctPassword(password);
          if (!auth) {
            return done(null, false, { message: "Invalid password." });
          }
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

//Create Users

server.post("/auth/singup", (req, res, next) => {
  let startDate = new Date(2027, 12, 12);
  let endDate = new Date(2029, 12, 12);
  var randomDate = DateGenerator.getRandomDateInRange(startDate, endDate);
  card_expiration = formatDate(randomDate, "dd/MM/yy");
  var cvu, card_cvv, card_id, rechargeCode;
  var new_balance = 0;

  const generator = () => {
    rechargeCode = Math.floor(Math.random() * 90000000) + 10000000;
    card_id = Math.floor(Math.random() * 900000000000000) + 4000000000000000;
    cvu = "222222".concat(
      Math.floor(Math.random() * 9000000000000000) + 1000000000000000
    );
    card_cvv = Math.floor(Math.random() * 900) + 100;
  };

  const checker = () => {
    generator();
    Account.findOne({
      where: {
        [Op.or]: [
          { rechargeCode: rechargeCode.toString() },
          { cvu },
          { card_id: card_id.toString() },
          { card_cvv: card_cvv.toString() },
        ],
      },
    }).then((acc) => {
      if (!acc) {
        console.log("no repitió");
        return;
      } else {
        console.log("repitió");
        checker();
      }
    });
  };

  checker();
  var dataUser = {
    ...req.body,
    username: req.body.username.toLowerCase(),
    email: req.body.email.toLowerCase(),
    birthdate: new Date(req.body.birthdate)
  };
  User.create(dataUser)
    .then((user) => {
      Account.create({
        cvu,
        card_id,
        card_expiration,
        card_cvv,
        userId: user.dataValues.id,
        rechargeCode,
        opening_date: formatDate(new Date(), "yyyy/MM/dd hh:mm:ss"),
      })
      .then((acc) => {
       return Unregistered.findAll({
          include: [Transaction],
      
          where: {
            email: req.body.email,
            status: "pending"
          },
        })
      })
      .then((trans) => {

        if(trans !== []){

          trans.map(function(tran) { 
            new_balance +=  parseFloat(tran.dataValues.transaction.dataValues.amount)
     
            //Create Accounttransaction sender
            Accounttransaction.create({
               cvu: cvu,
               number: tran.dataValues.transaction.dataValues.number,
               type: "receiver",
               old_balance: new_balance - tran.dataValues.transaction.dataValues.amount,
               new_balance: new_balance,
               status: "confirmed"
             });
     
             //Update Balance Account
     
             Account.update(
               {balance: new_balance},
               {where: { cvu: cvu }}
             );
           
          })

          //update Unregistered
          Unregistered.update(
            {status: "confirmed"},
            {where: 
              {
                email: req.body.email,
                status: "pending"
              },
            }
          );
          
        }
        
      })
      .then((acc2) => {
  
       return  Account.findOne({where: {cvu: cvu,}})

      })
      .then((acc3) => {

        res.status(200).send({ ...acc3.dataValues, balance: new_balance })
  
      })
      
    })

    .catch((err) => {

      res.status(404).send(err);

    });
});

//login user

server.post("/auth/login", (req, res, next) => {
  passport.authenticate("localStrategy", (err, user, fail) => {
    if (err) {
      return res.status(401).send(err);
    }
    if (fail) {
      return res.status(401).send(fail.message);
    }
    console.log("login OK, generating token...");
    const payload = {
      id: user.id,
      iat: Date.now(),
      username: user.username,
    };
    const token = jwt.sign(payload, "mobaAuth");
    res.json({ data: { token: token } });
  })(req, res, next);
});


module.exports = server;
