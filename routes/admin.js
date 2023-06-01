const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categorias");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const { eAdmin } = require("../helpers/eAdmin");

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
  res.send("Page of posts");
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {
  const { nome, slug } = req.body;

  let erros = [];

  if (!nome || nome == undefined || nome == null) {
    erros.push({ texto: "Nome invalido" });
  }

  if (!slug || slug == undefined || slug == null) {
    erros.push({ texto: "Slug inválido" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros });
    return null;
  }

  const NovaCategoria = {
    nome,
    slug,
  };

  new Categoria(NovaCategoria)
    .save()
    .then(() => {
      req.flash("success_msg", "Categoria criada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao salvar a categoria, tente novamente!"
      );
      res.redirect("/admin");
    });
});

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/categorias", {
        categorias: categorias.map((categorias) => categorias.toJSON()),
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .then((categoria) => {
      const nome = categoria.nome;
      const slug = categoria.slug;
      const id = categoria._id;
      res.render("admin/editcategorias", { nome, slug, id });
    })
    .catch((err) => {
      req.flash("error_msg", "Esta categoria não existe");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso!");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Houve um erro interno ao salvar a edição da categoria"
          );
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a categoria");
      req.redirect("/admin/categorias");
    });
});

router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find()
    .populate({ path: "categoria", strictPopulate: false })
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", {
        postagens: postagens.map((postagens) => postagens.toJSON()),
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as postagens");
      res.redirect("/admin");
    });
});

router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/addpostagem", {
        categorias: categorias.map((categorias) => categorias.toJSON()),
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});

router.post("/postagens/nova", eAdmin, (req, res) => {
  let erros = [];

  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria inválida, registre uma categoria" });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
  }

  const novaPostagem = {
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    conteudo: req.body.conteudo,
    categoria: req.body.categoria,
    slug: req.body.slug,
  };

  new Postagem(novaPostagem)
    .save()
    .then(() => {
      req.flash("success_msg", "Postagem criada com sucesso!");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um eror durante o salvamento da postagem");
      res.redirect("/admin/postagens");
    });
});

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .then((postagem) => {
      Categoria.find()
        .then((categorias) => {
          const titulo = postagem.titulo;
          const slug = postagem.slug;
          const descricao = postagem.descricao;
          const conteudo = postagem.conteudo;
          const id = req.params.id;
          res.render("admin/editpostagens", {
            categorias: categorias.map((categorias) => categorias.toJSON()),
            titulo,
            slug,
            descricao,
            conteudo,
            id,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um eror ao listas as categorias");
          req.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulario de edição"
      );
      res.redirect("/admin/postagens");
    });
});

router.post("/postagem/edit", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.slug;
      postagem.descricao = req.body.descricao;
      postagem.conteudo = req.body.conteudo;
      postagem.cateogira = req.body.categoria;

      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro interno");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um eror ao salvar a edição");
      res.redirect("/admin/postagens");
    });
});

router.post("/postagem/deletar", eAdmin, (req, res) => {
  Postagem.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro interno ao deletar postagem");
      res.redirect("/admin/postagens");
    });
});

module.exports = router;
