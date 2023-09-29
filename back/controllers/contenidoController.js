const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { response, request } = require('express');
const queriesContenidos = require('../database/queries/queriesContenidos');


//Todo Alicia
const getHistoria = async (req, res = response) => {
    queriesContenidos.getHistoria()
        .then(historia => {

            const resp = {
                success: true,
                msg: 'Registros encontrado',
                data: historia.dataValues
            };

            res.status(200).json(resp);

        }).catch(err => {

            const resp = { success: false, msg: 'No hay registros' };

            res.status(200).json(resp);
        });
}


const getHorarios = (req, res = response) => {
    queriesContenidos.getHorarios()
        .then(horarios => {

            horarios.map(h => {
                h.hEntrada = moment(h.hEntrada, "HH:mm:ss").format('HH:mm');
                h.hSalida = moment(h.hSalida, "HH:mm:ss").format('HH:mm');
            })

            const resp = {
                success: true,
                data: horarios,
            }

            res.status(200).json(resp);

        }).catch(err => {

            const resp = { success: false, msg: 'No hay registros' };

            res.status(200).json(resp);
        });
}


const getTelefonos = (req, res = response) => {
    queriesContenidos.getTelefonos()
        .then(telefonos => {

            const resp = {
                success: true,
                msg: 'Registros encontrados',
                data: telefonos
            }

            res.status(200).json(resp);

        }).catch(err => {

            const resp = { success: false,  msg: 'No hay registros' };

            res.status(200).json(resp);
        });
}


const getDirecciones = (req, res = response) => {
    queriesContenidos.getDirecciones()
        .then(direcciones => {

            const resp = {
                success: true,
                data: direcciones
            }

            res.status(200).json(resp);

        }).catch(err => {

            const resp = { success: false,  msg: 'No hay registros' };

            res.status(200).json(resp);
        });
}


const getImgTutorial = async (req, res = response) => {
    return res.sendFile(path.join(__dirname, '../uploads/tutorialGoogleMaps/', req.params.img));
}


const getCargosJunta = (req, res = response) => {
    queriesContenidos.getCargosJunta()
        .then(listadoCargos => {

            const resp = {
                success: true,
                msg: 'Registos encontrados',
                data: listadoCargos
            }

            res.status(200).json(resp);

        }).catch(err => {

            const resp = {  success: false, msg: 'No hay registros' };

            res.status(200).json(resp);
        });
}


const getIntegrantesCargo = (req, res = response) => {
    queriesContenidos.getCargoIntegrantes()
        .then(listadoJunta => {

            const resp = {
                success: true, 
                msg: 'Registos encontrados',
                data: listadoJunta
            }

            res.status(200).json(resp);

        }).catch(err => {

            const resp = { success: false, msg: 'No hay registros' };

            res.status(200).json(resp);
        });
}


const updateHistoria = async (req, res = response) => {
    let resp = { success: false, msg: 'Se ha producido un error' };

    try {

        const historia = await queriesContenidos.updateHistoria(req.body);
       
        if (historia) {
            resp = {
                success: true,
                msg: 'Historia actualizada con éxito',
                data: historia
            }
        }

        res.status(200).json(resp);

    } catch (err) {
        res.status(200).json(resp);
    }
}


const insertOrUpdateTfno = async (req, res = response) => { 
    let resp = { success: false, msg: 'Se ha producido un error' };
    let tfno;

    try {

        if (req.body.id == null) tfno = await queriesContenidos.insertTfno(req.body);
        else tfno = await queriesContenidos.updateTfno(req.body);
       
        if (tfno) {
            resp = {
                success: true,
                msg: 'Teléfono actualizado con éxito',
                data: tfno
            }
        }

        res.status(200).json(resp);

    } catch (err) {
        res.status(200).json(resp);
    }
}


const insertOrUpdateDir = async (req, res = response) => { 
    let resp = { success: false, msg: 'Se ha producido un error' };
    let dir;
  
    try {

        if (req.body.id == null) dir = await queriesContenidos.insertDir(req.body);
        else dir = await queriesContenidos.updateDir(req.body);
       
        if (dir) {
            resp = {
                success: true,
                msg: 'Dirección actualizada con éxito',
                data: dir
            }
        }

        res.status(200).json(resp);

    } catch (err) {
        res.status(200).json(resp);
    }
}


const insertCargo = async (payload) => { 
    let resp = { success: false, msg: 'Se ha producido un error' };

    try {
        const cargo = await queriesContenidos.insertCargo(payload);
       
        if (cargo) {
            resp = {
                success: true,
                msg: 'Cargo actualizado con éxito',
                data: cargo
            }
        }

    } catch (err) {}

    return resp;
}


const insertOrUpdateIntegranteJunta = async (req, res = response) => { 
    let resp = { success: false, msg: 'Se ha producido un error' };
    let intJunta;

    try {

        if (req.body.id == -1) intJunta = await queriesContenidos.insertIntegranteJunta(req.body);
        else intJunta = await queriesContenidos.updateIntegranteJunta(req.body);
       
        if (intJunta) {
            resp = {
                success: true,
                msg: 'Integrante actualizado con éxito',
                data: intJunta
            }
        }

        res.status(200).json(resp);

    } catch (err) {
        res.status(200).json(resp);
    }
}


const updateContacto = async (req, res = response) => {

    try {
        await Promise.all([
            req.body.telefonos.borrar.map(queriesContenidos.deleteTelefono),
            req.body.horarios.borrar.map(queriesContenidos.deleteHorario)
        ]);

        const [dirs, tlfns, horarios] = await Promise.all([
            Promise.all(req.body.direcciones.map(queriesContenidos.updateDireccion)),
            Promise.all(req.body.telefonos.guardar.map(t => t.id != -1 ? queriesContenidos.updateTelefono(t) : queriesContenidos.insertTelefono(t))),
            Promise.all(req.body.horarios.guardar.map(h => h.id != -1 ? queriesContenidos.updateHorario(h) : queriesContenidos.insertHorario(h)))
        ]);

        const resp = {
            success: true,
            msg: 'Se han guardado los cambios',
            data: {
                "dirs": dirs,
                "tlfns": tlfns,
                "horarios": horarios
            }
        }

        res.status(201).json(resp);

    } catch (err) {

        const resp = {
            success: false,
            msg: 'Se ha producido un error',
        }

        res.status(200).json(resp);
    }
}


const deleteTfno = async (req, res = response) => {
    let resp = { success: false, msg: 'Se ha producido un error' }

    try {

        const tfno = await queriesContenidos.deleteTfno(req.params.id);

        if (tfno == 1) {
            resp = {
                success: true,
                msg: 'Teléfono eliminado con éxito',
                data: req.params.id
            }
        }

        res.status(200).json(resp);

    } catch (err) {
        res.status(200).json(resp);
    }
}


const deleteCargo = async (req, res = response) => {
    let resp = { success: false, msg: 'Se ha producido un error' }

    try {

        const cargo = await queriesContenidos.deleteCargo(req.params.id);

        if (cargo == 1) {
            resp = {
                success: true,
                msg: 'Cargo eliminado con éxito',
                data: req.params.id
            }
        }

        res.status(200).json(resp);

    } catch (err) {
        res.status(200).json(resp);
    }
}


const deleteIntegranteJunta = async (req, res = response) => {
    let resp = { success: false, msg: 'Se ha producido un error' }

    try {

        const integrante = await queriesContenidos.deleteIntegranteJunta(req.params.id);
        
        if (integrante == 1) {
            resp = {
                success: true,
                msg: 'Integrante eliminado con éxito',
                data: req.params.id
            }
        }

        res.status(200).json(resp);

    } catch (err) {
        res.status(200).json(resp);
    }
}


module.exports = {
    getHistoria,
    getHorarios,
    getTelefonos,
    getDirecciones,
    getCargosJunta,
    getIntegrantesCargo,
    updateHistoria,
    insertOrUpdateTfno,
    insertOrUpdateDir,
    insertCargo,
    insertOrUpdateIntegranteJunta,
    updateContacto,
    deleteTfno,
    deleteCargo,
    deleteIntegranteJunta,getImgTutorial
}