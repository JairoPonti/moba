const express = require("express");
const server = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { Account, User, Transaction, Accounttransaction } = require("../db");
const { Op } = require("sequelize");
const cors = require("cors");
const { formatDate } = require("date-utils-2020");
let DateGenerator = require("random-date-generator");

// middlewares
server.use(morgan("dev"));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors());
//Create account

//Pasar por body en el objeto una key "user", con dni o email, para generar la relacion

server.post("/accounts", (req, res, next) => {
  User.findOne({
    where: {
      [Op.or]: [{ dni: req.body.user }, { email: req.body.user }],
    },
  })

    .then((user) => {
      return Account.create({
        cvu: req.body.cvu,
        balance: req.body.balance,
        card_id: req.body.card_id,
        card_expiration: req.body.card_expiration,
        userId: user.dataValues.id,
      });
    })

    .then((acc) => {
      res.status(200).send(acc);
    })

    .catch((err) => {
      res.status(404).send(err);
    });
});

// get all accounts

server.get("/accounts", (req, res, next) => {
  Account.findAll({
    include: [User],
  })
    .then((accounts) => {
      res.send(accounts);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

// get specific account by cvu

server.get("/accounts/:cvu", (req, res, next) => {
  Account.findOne({
    include: [User],

    where: {
      cvu: req.params.cvu,
    },
  })
    .then((account) => res.send(account))
    .catch((err) => {
      res.status(404).send(err);
    });
});

// update accounts by cvu

server.put("/accounts/:cvu", (req, res) => {
  Account.update(req.body, {
    where: { cvu: req.params.cvu },
  })
    .then((account) => res.status(200).send(account))
    .catch((err) => {
      res.status(404).send(err);
    });
});

//RECHARGE MONEY
server.put("/accounts/recharge/:userCode", (req, res) => {
  const rechargeCode = req.params.userCode;
  const { amount } = req.body;
  var account;
  if (!amount || typeof parseInt(amount) !== "number" || parseInt(amount) < 0) {
    return res.status(400).send("Invalid amount");
  }
 
  Account.findOne({
    where: { rechargeCode },
  })
    .then((acc) => {
      if (!acc) {
        return res.status(404).send("Invalid recharge code");
      }
      acc.balance = parseInt(acc.balance) + parseInt(amount);
      acc.save().then((acc) => {
        console.log(acc.balance);
        account = acc;
        Transaction.create({
          amount,
          transaction_type: "charge",
          status: "confirmed",
          transaction_code: Math.floor((Math.random() * 9000) + 1000)
        }).then((tr) => {
          
          Accounttransaction.create({
            cvu: account.cvu,
            number: tr.dataValues.number,
            type: "charge",
            old_balance: parseInt(acc.balance) - parseInt(amount),
            new_balance: acc.balance,
            status:'confirmed'
          });

          res.send(tr);
        });
      });
    })
    .catch((err) => console.log(err));
});

//card update from cvu

server.put("/accounts/updatecard/:cvu", (req, res) => {

  let startDate = new Date(2027, 12, 12);
  let endDate = new Date(2029, 12, 12);
  var randomDate = DateGenerator.getRandomDateInRange(startDate, endDate);
  card_expiration = formatDate(randomDate, "dd/MM/yy");
  var card_cvv, card_id;

  const generator = () => {
    card_id = Math.floor(Math.random() * 900000000000000) + 4000000000000000;
    card_cvv = Math.floor(Math.random() * 900) + 100;
  };

  const checker = () => {
    generator();
    Account.findOne({
      where: {
        [Op.or]: [
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

  Account.update({
     card_id,
     card_cvv,
     card_expiration
    }, {
      where: { cvu: req.params.cvu },
    })
    .then((account) => res.status(200).send(account))
    .catch((err) => {
      res.status(404).send(err);
    });
});




module.exports = server;
