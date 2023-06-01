const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/registro", (req, res) => {
  res.render("usuarios/registro");
});

router.post("/registro", (req, res) => {
  const { nome, email, senha, senha2 } = req.body;
  let erros = [];

  if (!nome || nome == undefined || nome == null) {
    erros.push({ texto: "Nome invalido" });
  }

  if (!email || email == undefined || email == null) {
    erros.push({ texto: "Email invalido" });
  }

  if (!senha || senha == undefined || senha == null) {
    erros.push({ texto: "Senha invalida" });
  }

  if (senha.length < 7) {
    erros.push({ texto: "Senha muito curta" });
  }

  if (senha !== senha2) {
    erros.push({ texto: "As senhas são diferentes, tente novamente" });
  }

  if (erros.length > 0) {
    res.render("usuarios/registro", { erros: erros });
  } else {
    Usuario.findOne({ email: email })
      .then((usuario) => {
        if (usuario) {
          req.flash(
            "error_msg",
            "Já existe uma conta com este e-mail no noso sistema"
          );
          res.redirect("/usuarios/registro");
        } else {
          let numberAdmin;
          if (req.body.nome == "admin") {
            numberAdmin = 1;
          } else {
            numberAdmin = 2;
          }

          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            eAdmin: numberAdmin,
          });

          console.log(req.body.nome);
          console.log(novoUsuario);

          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash(
                  "error_msg",
                  "Houve um eror durante o salvamento do usuário"
                );
                res.redirect("/");
              } else {
                novoUsuario.senha = hash;
                novoUsuario
                  .save()
                  .then(() => {
                    req.flash("success_msg", "Usuario criado com sucesso!");
                    res.redirect("/");
                  })
                  .catch((err) => {
                    console.log(err);
                    req.flash("error_msg", "Houve um erro ao criar o usuario");
                    res.redirect("/usuarios/registro");
                  });
              }
            });
          });
        }
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/");
      });
  }
});

router.get("/login", (req, res) => {
  res.render("usuarios/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("rror_msg", "Erro ao deslogar da conta");
      res.redirect("/");
    } else {
      req.flash("success_msg", "Deslogado com sucesso");
      res.redirect("/");
    }
  });
});

module.exports = router;
