const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');


const app = express();

app.get('/usuario', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    //Filtro manual (ejemplo):
    //Usuario.find({ role: 'ADMIN_ROLE' })

    Usuario.find({ estado: true }, 'nombre email role estado google')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            // Repetir para que cuente en base al filtro
            // Usuario.count({ role: 'ADMIN_ROLE' }, (err, conteo) => {
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    usuariosActivos: conteo
                });
            });
        });
});

app.post('/usuario', (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:ident', (req, res) => {

    let id = req.params.ident;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //delete body.password;

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

// Cambia solamente el estado del registro:

app.delete('/usuario/:id', (req, res) => {

    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    };


    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioCambiado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioCambiado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioCambiado
        });
    });

});

// Elimina el registro de la BD:
/*
app.delete('/usuario/:id', (req, res) => {

    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});
*/
module.exports = app;